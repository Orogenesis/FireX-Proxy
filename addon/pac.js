let proxy              = 'DIRECT';
let blacklist          = {};
let isBlacklistEnabled = false;

/**
 * @param {string} pattern
 * @param {string} row
 *
 * @returns {boolean}
 */
function globMatch(pattern, row) {
    let lookup = [];

    for (let i = 0; i <= row.length; ++i) {
        lookup[i] = [].fill.call({
            length: pattern.length
        }, false);
    }

    lookup[0][0] = true;

    for (let j = 1; j <= pattern.length; j++) {
        if (pattern[j - 1] === '*') {
            lookup[0][j] = lookup[0][j - 1];
        }
    }

    for (let i = 1; i <= row.length; i++) {
        for (let j = 1; j <= pattern.length; j++) {
            if (pattern[j - 1] === '*') {
                lookup[i][j] = lookup[i][j - 1] || lookup[i - 1][j];
            } else if (pattern[j - 1] === '?' || row[i - 1] === pattern[j - 1]) {
                lookup[i][j] = lookup[i - 1][j - 1];
            } else {
                lookup[i][j] = false;
            }
        }
    }

    return lookup[row.length][pattern.length];
}

/**
 * @param {string} url
 * @param {string} host
 *
 * @return {string}
 */
function FindProxyForURL(url, host) {
    if (!isBlacklistEnabled) {
        return proxy;
    }

    for (let pattern in blacklist) {
        if (!blacklist.hasOwnProperty(pattern)) {
            continue;
        }

        if (blacklist[pattern] && globMatch(pattern, host)) {
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
