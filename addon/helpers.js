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
function versionCompare(a, b) {
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
 * @returns {boolean}
 */
function isChrome() {
    return !window.browser && window.chrome;
}
