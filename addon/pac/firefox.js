let proxy              = 'DIRECT';
let blacklist          = {};
let isBlacklistEnabled = false;

/**
 * @param {string} url
 * @param {string} host
 *
 * @return {string}
 */
function FindProxyForURL(url, host) {
    if (host === 'localhost' || shExpMatch(host, 'localhost.*') || shExpMatch(host, '*.local') || host === '127.0.0.1') {
        return 'DIRECT';
    }

    if (isInNet(host, '10.0.0.0', '255.0.0.0') || isInNet(host, '192.168.0.0', '255.255.0.0')) {
        return 'DIRECT';
    }

    if (!isBlacklistEnabled) {
        return proxy;
    }

    for (let pattern in blacklist) {
        if (!blacklist.hasOwnProperty(pattern)) {
            continue;
        }

        if (blacklist[pattern] && shExpMatch(host, pattern)) {
            return proxy;
        }
    }

    return 'DIRECT';
}

browser.runtime.onMessage.addListener(
    (request, sender, response) => {
        proxy = request.proxy === undefined
            ? proxy
            : request.proxy;

        blacklist = request.blacklist === undefined
            ? blacklist
            : request.blacklist;

        isBlacklistEnabled = request.isBlacklistEnabled === undefined
            ? isBlacklistEnabled
            : request.isBlacklistEnabled;

        response(proxy);
    }
);
