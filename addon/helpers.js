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

/**
 * @returns {boolean}
 */
export function isFirefox() {
  return navigator.userAgent.indexOf('Firefox') > -1;
}

/**
 * @param {string} oldVersion
 * @param {string} newVersion
 * @return {boolean}
 */
export function isMajorUpdate(oldVersion, newVersion) {
  return parseInt(oldVersion.split('.')[0]) < parseInt(newVersion.split('.')[0]);
}

/**
 * @param {string} oldVersion
 * @param {string} newVersion
 * @return {boolean}
 */
export function isMinorUpdate(oldVersion, newVersion) {
  let oldSplits = oldVersion.split('.');
  let newSplits = newVersion.split('.');

  return oldSplits[0] === newSplits[0] && parseInt(oldSplits[1] || 0) < parseInt(newSplits[1] || 999);
}

/**
 * @param {string} str
 * @param {string} shexp
 * @returns {boolean}
 */
export function shExpMatch(str, shexp) {
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
export function isInNet(host, pattern, mask) {
  const b = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);

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
