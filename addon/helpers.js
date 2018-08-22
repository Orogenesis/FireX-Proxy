/**
 * Returns 1 (a > b)
 * Returns 0 (a == b)
 * Returns -1 (a < b)
 *
 * @param {string} a
 * @param {string} b
 *
 * @returns {number}
 */
export function versionCompare(a, b) {
    if (a === b) {
        return 0;
    }

    let ac = a.split('.');
    let bc = b.split('.');

    let maxLength = Math.max(ac.length, bc.length);

    let filler = length => new Array(maxLength - length).fill(0);

    ac = ac.concat(filler(ac.length));
    bc = bc.concat(filler(bc.length));

    for (let i = 0; i < maxLength; i++) {
        if (parseInt(ac[i]) > parseInt(bc[i])) {
            return 1;
        } else if (parseInt(ac[i]) < parseInt(bc[i])) {
            return -1;
        }
    }

    return 0;
}

/**
 * @param {string} version
 * @returns {boolean}
 */
export function isMajorVersion(version) {
    return version.split('.').slice(1).filter(n => n > 0).length === 0;
}

/**
 * @param {string} version
 * @returns {boolean}
 */
export function isMinorVersion(version) {
    const splits = version.split('.');

    return (splits[1] || 0) > 0 && splits.slice(2).filter(n => n > 0).length === 0;
}

/**
 * @returns {boolean}
 */
export function isChrome() {
    return navigator.userAgent.indexOf('Chrome') > -1;
}
