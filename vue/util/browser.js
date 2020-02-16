const firefoxMarketURL = 'https://addons.mozilla.org/en-US/firefox/addon/firex-proxy';
const chromeMarketURL = 'https://chrome.google.com/webstore/detail/firex-proxy/jccfbhillgcekaepchoahodacnlhcbnj';

/**
 * @returns {boolean}
 */
export function isChrome() {
  return navigator.userAgent.indexOf('Chrome') > -1;
}

/**
 * @returns {boolean}
 */
export function isFirefox() {
  return navigator.userAgent.indexOf('Firefox') > -1;
}

export function getMarketURL() {
  if (isFirefox()) {
    return firefoxMarketURL;
  }

  return chromeMarketURL;
}
