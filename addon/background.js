import { ProxyProvider } from './proxyProvider.js'
import { Addresses } from './addresses.js'
import { isChrome, isFirefox } from './helpers.js'
import { Connector } from './connector.js'
import { Address } from './address.js'
import { detectConflicts } from './conflict.js'
import { User } from "./user.js"

(function setup() {
  let proxyListSession = new Addresses();
  let premiumListSession = new Addresses();
  let user = new User();
  let proxyProvider = new ProxyProvider(user);
  let connector = new Connector();

  let blacklistSession = [];
  let pendingRequests = [];
  let isBlacklistEnabled = false;
  let authenticationEvents = false;
  let appState = {
    filters: {
      countryFilter: [],
      protocolFilter: [],
      protocols: [],
      favorites: true
    }
  };

  connector.addObserver(newConnector => {
    const isConnected = newConnector
      .connected instanceof Address;

    const proxies = premiumListSession.filterEnabled()
      .union(proxyListSession.filterEnabled());

    browser.browserAction.setBadgeText({
      text: isConnected && !proxies.isEmpty() ? proxies.one().getIsoCode() : ''
    });
  });

  // Disable all proxies on browser start
  connector.disconnect();

  browser.storage.local.get()
    .then(storage => {
      const favorites = (storage.favorites || [])
        .map(element => Object.assign(new Address(), element));

      proxyListSession = Addresses.create(favorites).unique().union(proxyListSession);
      blacklistSession = storage.patterns || [];
      isBlacklistEnabled = storage.isBlacklistEnabled || false;

      user.credentials = storage.credentials || {};
    });

  browser.storage.onChanged.addListener(storage => {
    if (storage.isBlacklistEnabled || storage.patterns) {
      isBlacklistEnabled = storage.isBlacklistEnabled ? storage.isBlacklistEnabled.newValue : isBlacklistEnabled;
      blacklistSession = storage.patterns ? storage.patterns.newValue : blacklistSession ;

      const proxies = premiumListSession.filterEnabled()
        .union(proxyListSession.filterEnabled());

      if (!proxies.isEmpty()) {
        connector.connect(proxies.one(), blacklistSession, isBlacklistEnabled);
      }
    }
  });

  browser.runtime.onInstalled.addListener(details => {
    const { reason } = details;

    if (reason === 'update') {
      if (browser.i18n.getUILanguage() === 'ru') {
        browser.tabs.create({ url: '../welcome.html' });
      }
    }
  });

  function setupAuthentication() {
    if (authenticationEvents) {
      return;
    }

    const permissions = {
      origins: ['<all_urls>'],
      permissions: ['webRequest', 'webRequestBlocking']
    };

    const onAuthHandlerAsync = ({ isProxy, requestId }, asyncCallback) => {
      if (!isProxy) {
        return asyncCallback();
      }

      if (pendingRequests.indexOf(requestId) > -1) {
        return asyncCallback({
          cancel: true
        });
      }

      pendingRequests.push(requestId);

      try {
        const proxy = proxyListSession.filterEnabled().one();

        if (proxy.getUsername() && proxy.getPassword()) {
          asyncCallback({
            authCredentials: {
              username: proxy.getUsername(),
              password: proxy.getPassword()
            }
          });
        }
      } catch (e) {
        asyncCallback({
          cancel: true
        });
      }
    };

    const onAuthHandler = ({ isProxy, requestId }) => {
      if (!isProxy) {
        return {};
      }

      if (pendingRequests.indexOf(requestId) > -1) {
        return { cancel: true };
      }

      pendingRequests.push(requestId);

      try {
        const proxy = proxyListSession.filterEnabled().one();

        if (proxy.getUsername() && proxy.getPassword()) {
          return new Promise(resolve => resolve({
            authCredentials: {
              username: proxy.getUsername(),
              password: proxy.getPassword()
            }
          }));
        }
      } catch (e) {
        return { cancel: true };
      }
    };

    const onRequestFinished = ({ requestId }) => {
      const index = pendingRequests.indexOf(requestId);

      if (index > -1) {
        pendingRequests.splice(index, 1);
      }
    };

    browser.permissions.contains(permissions).then(yes => {
      if (!yes) {
        return;
      }

      if (isFirefox()) {
        browser.webRequest.onAuthRequired.addListener(onAuthHandler, { urls: ["<all_urls>"] }, ["blocking"]);
      } else {
        browser.webRequest.onAuthRequired.addListener(onAuthHandlerAsync, { urls: ["<all_urls>"] }, ["asyncBlocking"]);
      }

      browser.webRequest.onCompleted.addListener(onRequestFinished, { urls: ["<all_urls>"] });
      browser.webRequest.onErrorOccurred.addListener(onRequestFinished, { urls: ["<all_urls>"] });

      authenticationEvents = true;
    })
  }

  setupAuthentication();

  // Chrome on macOS closes the extension popup when permissions are accepted by user
  // so message does not accepted by onMessage event
  if (browser.permissions.onAdded) {
    browser.permissions.onAdded.addListener(setupAuthentication);
  }

  browser.runtime.onMessage.addListener(
    ({ name, message }, sender, sendResponse) => {
      switch (name) {
        case 'resolve-conflicts': {
          if (isChrome()) {
            detectConflicts().then(conflicts => conflicts.forEach(extension => browser.management.setEnabled(extension.id, false)));
          }

          break;
        }
        case 'get-conflicts': {
          detectConflicts().then(conflicts => sendResponse(conflicts));
          break;
        }
        case 'get-proxies': {
          const { force } = message;

          if (!proxyListSession.byExcludeFavorites().isEmpty() && !force) {
            sendResponse(proxyListSession.unique());
          } else {
            proxyProvider
              .getProxies()
              .then(response => {
                const favoriteProxies = proxyListSession.byFavorite();

                proxyListSession = proxyListSession.filterEnabled();
                proxyListSession = proxyListSession.concat(favoriteProxies);
                proxyListSession = proxyListSession.concat(response);

                sendResponse(proxyListSession.unique());
              })
              .catch(() => sendResponse([]));
          }

          break;
        }
        case 'connect': {
          const { ipAddress, port } = message;

          proxyListSession.disableAll();
          premiumListSession.disableAll();

          const proxy = proxyListSession.byIpAddress(ipAddress).byPort(port).one().enable();
          connector.connect(proxy, blacklistSession, isBlacklistEnabled);

          sendResponse(proxy);
          break;
        }
        case 'connect-premium': {
          const { ipAddress, port } = message;

          proxyListSession.disableAll();
          premiumListSession.disableAll();

          const proxy = premiumListSession.byIpAddress(ipAddress).byPort(port).one().enable();
          connector.connect(proxy, blacklistSession, isBlacklistEnabled);

          sendResponse(proxy);
          break;
        }
        case 'disconnect': {
          connector.disconnect().then(() => {
            proxyListSession.disableAll();
            premiumListSession.disableAll();
            sendResponse();
          });

          break;
        }
        case 'toggle-favorite': {
          const { ipAddress, port } = message;

          proxyListSession
            .byIpAddress(ipAddress)
            .byPort(port)
            .one()
            .toggleFavorite();

          browser.storage.local.set({
            favorites: [...proxyListSession.byFavorite()]
          });

          sendResponse();
          break;
        }
        case 'update-state': {
          appState = { ...appState, ...message };
          sendResponse(appState);
          break;
        }
        case 'poll-state': {
          sendResponse(appState);
          break;
        }
        case 'add-proxy': {
          const { protocol, ipAddress, username, password, port } = message;
          const newAddress = new Address()
            .setProtocol(protocol)
            .setIPAddress(ipAddress)
            .setPort(port)
            .setFavorite(true)
            .setUsername(username)
            .setPassword(password);

          proxyListSession.unshift(newAddress);
          browser.storage.local.set({ favorites: [...proxyListSession.byFavorite()] });

          sendResponse(newAddress);
          break;
        }
        case 'register-authentication': {
          // browser.permissions.onAdded is not supported by Firefox
          setupAuthentication();
          sendResponse();
          break;
        }
        case 'get-user': {
          user.parseCookies().then(metadata => sendResponse(metadata));
          break;
        }
        case 'relevant': {
          const handler = response => {
            premiumListSession = premiumListSession.filterEnabled();
            premiumListSession = premiumListSession.concat(response);
            sendResponse(premiumListSession.unique());
          };

          proxyProvider.getRelevantProxies().then(handler).catch(() => sendResponse([]));
          break;
        }
        case 'get-profile': {
          user.getProfile().then(profile => sendResponse(profile));
          break;
        }
      }

      return true;
    }
  );
})();
