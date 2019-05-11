/* eslint no-unused-vars: ["error", {"args": "none", "varsIgnorePattern": "^(FindProxyForURL)$"}] */

let proxy              = 'DIRECT';
let blacklist          = [];
let isBlacklistEnabled = false;

/**
 * @param {string} str
 * @param {string} shexp
 * @returns {boolean}
 */
function shExpMatch(str, shexp) {
    if (typeof str !== 'string' || typeof shexp !== 'string') {
        return false;
    }

    if (shexp === '*') {
        return true;
    }

    if (str === '' && shexp === '') {
        return true;
    }

    str = str.toLowerCase();
    shexp = shexp.toLowerCase();

    let len = str.length;
    let pieces = shexp.split('*');
    let start = 0;
    let i = 0;

    for (; i < pieces.length; i++) {
        if (pieces[i] === '') {
            continue;
        }

        if (start > len) {
            return false;
        }

        start = str.indexOf(pieces[i]);

        if (start === -1) {
            return false;
        }

        start += pieces[i].length;

        str = str.substring(start, len);
        len = str.length;
    }

    i--;

    return pieces[i] === '' || str === '';
}

/**
 * @param {string} host
 * @param {string} pattern
 * @param {string} mask
 * @returns {boolean}
 */
function isInNet(host, pattern, mask) {
    let b = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
        .exec(host);

    if (!b || b[1] > 255 || b[2] > 255 || b[3] > 255 || b[4] > 255) {
        return false;
    }

    let p = pattern.split('.');
    let m = mask.split('.');
    let h = host.split('.');

    if ((p.length === m.length) && (m.length === h.length)) {
        for (let i = 0; i < p.length; i++) {
            if ((p[i] & m[i]) !== (m[i] & h[i])) {
                return false;
            }
        }

        return true;
    }

    return false;
}

/**
 * @param {string} url
 * @param {string} host
 *
 * @return {string}
 */
function FindProxyForURL(url, host) {
    if (host === 'localhost' ||
        shExpMatch(host, 'localhost.*') ||
        shExpMatch(host, '*.local') ||
        host === '127.0.0.1' ||
        shExpMatch(host, '*.firexproxy.com') ||
        shExpMatch(host, 'firexproxy.com')) {
        return 'DIRECT';
    }

    if (isInNet(host, '10.0.0.0', '255.0.0.0') || isInNet(host, '192.168.0.0', '255.255.0.0')) {
        return 'DIRECT';
    }

    if (!isBlacklistEnabled) {
        return proxy;
    }

    for (let pattern in blacklist) {
        if (shExpMatch(host, blacklist[pattern])) {
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
