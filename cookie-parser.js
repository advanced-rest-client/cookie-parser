/**
@license
Copyright 2017 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/

/**
 * Copyright 2016 Pawel Psztyc, The ARC team
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable no-control-regex */
const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * A Cookie object.
 * It is based on https://github.com/pillarjs/cookies/blob/master/lib/cookies.js
 */
export class Cookie {
  /**
   * Constructs a new cookie.
   *
   * @param {Stirng} name Cookie name
   * @param {Stirng} value Cookie value
   * @param {Object} opts Additional cookie attributes:
   * - max-age {Number}
   * - expires {Number}
   * - domain {String}
   * - path {String}
   * - secure {Boolean}
   * - httpOnly {Boolean}
   */
  constructor(name, value, opts) {
    if (!fieldContentRegExp.test(name)) {
      throw new TypeError('Argument `name` is invalid');
    }
    if (value && !fieldContentRegExp.test(value)) {
      throw new TypeError('Argument `value` is invalid');
    }
    opts = opts || {};
    if (opts.path && !fieldContentRegExp.test(opts.path)) {
      throw new TypeError('Option `path` is invalid');
    }
    if (opts.domain && !fieldContentRegExp.test(opts.domain)) {
      throw new TypeError('Option `domain` is invalid');
    }
    Object.defineProperty(this, 'max-age', {
      configurable: true,
      enumerable: true,
      get: function() {
        return this._maxAge;
      },
      set: function(v) {
        this.maxAge = v;
      }
    });
    this._expires = 0;
    this._domain = undefined;
    this._maxAge = undefined;
    this.name = name;
    this.value = value || '';
    this.created = Date.now();
    this.lastAccess = this.created;

    if ('max-age' in opts) {
      this.maxAge = opts['max-age'];
    } else if ('expires' in opts) {
      this.expires = opts.expires;
    } else {
      this.persistent = false;
      // see http://stackoverflow.com/a/11526569/1127848
      this._expires = new Date(8640000000000000).getTime();
    }
    if ('domain' in opts) {
      this.domain = opts.domain;
    } else {
      this.hostOnly = false;
    }
    if ('path' in opts) {
      this.path = opts.path;
    }
    if ('secure' in opts) {
      this.secure = opts.secure;
    }
    if ('httpOnly' in opts) {
      this.httpOnly = opts.httpOnly;
    }
  }
  /**
   * @param {Number} max The max age value
   */
  set maxAge(max) {
    max = Number(max);
    if (max !== max) {
      return;
    }
    this._maxAge = max;
    if (max <= 0) {
      // see http://stackoverflow.com/a/11526569/1127848
      // and https://tools.ietf.org/html/rfc6265#section-5.2.2
      this._expires = new Date(-8640000000000000).getTime();
    } else {
      let now = Date.now();
      now += (max * 1000);
      this._expires = now;
    }
    this.persistent = true;
  }
  /**
   * @return {Number} Returns a value of maxAge property
   */
  get maxAge() {
    return this['max-age'];
  }
  /**
   * @param {Date|String} expires Date or parsable date string
   */
  set expires(expires) {
    if (expires instanceof Date) {
      expires = expires.getTime();
    } else if (typeof expires === 'string') {
      const tmp = new Date(expires);
      if (tmp.toString() === 'Invalid Date') {
        expires = 0;
      } else {
        expires = tmp.getTime();
      }
    }
    this._expires = expires;
    this.persistent = true;
  }
  /**
   * @return {Date}
   */
  get expires() {
    return this._expires;
  }
  /**
   * @param {String} domain Cookie domain
   */
  set domain(domain) {
    this._domain = domain;
    if (!domain) {
      this.hostOnly = false;
    } else {
      this.hostOnly = true;
    }
  }
  /**
   * @return {String} Cookie domain
   */
  get domain() {
    return this._domain;
  }
  /**
   * @return {String} Cookie's `name=value` string.
   */
  toString() {
    return this.name + '=' + this.value;
  }
  /**
   * Returns a Cookie as a HTTP header string.
   * @return {String} Cookie string as a HTTP header value
   */
  toHeader() {
    let header = this.toString();
    let expires;
    if (this._expires) {
      expires = new Date(this._expires);
      if (expires.toString() === 'Invalid Date') {
        expires = new Date(0);
      }
    }
    if (expires) {
      header += '; expires=' + expires.toUTCString();
    }
    if (this.path) {
      header += '; path=' + this.path;
    }
    if (this.domain) {
      header += '; domain=' + this.domain;
    }
    if (this.httpOnly) {
      header += '; httpOnly=' + this.httpOnly;
    }
    return header;
  }
  /**
   * Override toJSON behaviour so it will eliminate
   * all _* properies and replace it with a proper ones.
   *
   * @return {Object}
   */
  toJSON() {
    const copy = Object.assign({}, this);
    const keys = Object.keys(copy);
    const under = keys.filter((key) => key.indexOf('_') === 0);
    under.forEach((key) => {
      const realKey = key.substr(1);
      copy[realKey] = copy[key];
      delete copy[key];
    });
    return copy;
  }
}

/**
 * A library to handle Cookie parsing.
 * It is based on https://github.com/pillarjs/cookies/blob/master/lib/cookies.js
 */
export class Cookies {
  /**
   * Constructs an object.
   *
   * @param {String?} cookie A HTTP cookie strig to parse.
   * @param {String?} url A request url for this object. If empty some
   * cookie computations (like checking if cookies match) will be omnited.
   */
  constructor(cookie, url) {
    if (!cookie) {
      cookie = '';
    }
    /**
     * A list of parsed cookies.
     *
     * @type {Array<Cookie>}
     */
    this.cookies = Cookies.parse(cookie);
    /**
     * A base URL for this object.
     *
     * @type {String}
     */
    this.url = url;

    this._fillCookieAttributes();
  }
  /**
   * Set's the URL and parses it setting `uri` property.
   * @param {String} url Cookie URL
   */
  set url(url) {
    if (url) {
      this._url = url;
      this.uri = new URL(this.url);
    } else {
      this._url = undefined;
      this.uri = undefined;
    }
  }
  /**
   * @return {String} Cookie URL
   */
  get url() {
    return this._url;
  }
  /**
   * Parses a cookie string to a list of Cookie objects.
   *
   * @param {String} cookies A HTTP cookie string
   * @return {Array<Cookie>} List of parsed cookies.
   */
  static parse(cookies) {
    const cookieParts = ['path', 'domain', 'max-age', 'expires',
    'secure', 'httponly'];
    const list = [];
    if (!cookies || !cookies.trim()) {
      return list;
    }
    cookies.split(/;/).map((cookie) => {
      const parts = cookie.split(/=/, 2);
      if (parts.length === 0) {
        return;
      }
      const name = decodeURIComponent(parts[0].trim());
      if (!name) {
        return;
      }
      const lowerName = name.toLowerCase();
      let value;
      if (parts.length > 1) {
        try {
          value = decodeURIComponent(parts[1].trim());
        } catch (e) {
          value = parts[1];
        }
      } else {
        value = null;
      }
      // if this is an attribute of previous cookie, set it for last
      // added cookie.
      if (cookieParts.indexOf(lowerName) !== -1) {
        if (list.length - 1 >= 0) {
          list[list.length - 1][lowerName] = value;
        }
      } else {
        try {
          list.push(new Cookie(name, value));
        } catch (e) {
          // ..
        }
      }
    });
    return list;
  }
  /**
   * Clients must fill `path` and `domain` attribute if not set by the
   * server to match current request url.
   */
  _fillCookieAttributes() {
    if (!this.uri) {
      return;
    }
    let domain = this.uri.hostname;
    if (!domain) {
      return;
    } else {
      domain = domain.toLowerCase();
    }
    const path = this._getPath(this.url);
    this.cookies.forEach((cookie) => {
      if (!cookie.path) {
        cookie.path = path;
      }
      const cDomain = cookie.domain;
      if (!cDomain) {
        cookie.domain = domain;
        // point 6. of https://tools.ietf.org/html/rfc6265#section-5.3
        cookie.hostOnly = true;
      }
    });
  }

  /**
   * Get a cookie by name.
   *
   * @param {String} name Cookie name
   * @return {Cookie} A Cookie object or null.
   */
  get(name) {
    const cookies = this.cookies;
    for (let i = 0, len = cookies.length; i < len; i++) {
      if (cookies[i].name === name) {
        return cookies[i];
      }
    }
    return null;
  }
  /**
   * Adds a cookie to the list of cookies.
   *
   * @param {String} name Name of the cookie.
   * @param {String} value Value of the cookie.
   * @param {Object<String, String>} opts Other cookie options to set.
   */
  set(name, value, opts) {
    const cookie = new Cookie(name, value, opts);
    const cookies = this.cookies.filter((c) => c.name !== name);
    cookies.push(cookie);
    this.cookies = cookies;
  }

  /**
   * Returns a string that can be used in a HTTP header value for Cookie.
   * The structure of the cookie string depends on if you want to send a
   * cookie from the server to client or other way around.
   * When you want to send the `Cookie` header to server set
   * `toServer` argument to true. Then it will produce only `name=value;`
   * string. Otherwise it will be the `Set-Cookie` header value
   * containing all other cookies properties.
   *
   * @param {Boolean} toServer True if produced string is to be used with
   * `Cookie` header
   * @return {String}
   */
  toString(toServer) {
    const parts = [];
    if (toServer) {
      this.cookies.forEach((cookie) => {
        parts.push(cookie.toString());
      });
    } else {
      this.cookies.forEach((cookie) => {
        parts.push(cookie.toHeader());
      });
    }
    return parts.join('; ');
  }
  /**
   * Remove cookies from `this.cookies` that has been set for different
   * domain and path.
   * This function has no effect if the URL is not set.
   *
   * This function follows an alghoritm defined in https://tools.ietf.org/html/rfc6265 for
   * domain match.
   *
   * @return {Array<Cookie>} A list of removed cookies.
   */
  filter() {
    if (!this.uri) {
      return [];
    }
    let domain = this.uri.hostname;
    if (!domain) {
      return [];
    } else {
      domain = domain.toLowerCase();
    }
    const path = this._getPath(this.url);
    const removed = [];
    const validCookies = this.cookies.filter((cookie) => {
      if (!cookie.path) {
        cookie.path = path;
      }
      const cDomain = cookie.domain;
      if (!cDomain) {
        cookie.domain = domain;
        // point 6. of https://tools.ietf.org/html/rfc6265#section-5.3
        cookie.hostOnly = true;
        return true;
      }
      const res = this._matchDomain(cDomain) && this._matchPath(cookie.path);
      if (!res) {
        removed.push(cookie);
      }
      return res;
    });
    this.cookies = validCookies;
    return removed;
  }
  /**
   * Merges this cookies with another Cookies object.
   * This cookies will be overwritten by passed cookies according to
   * the HTTP spec.
   * This function is useful when you need to override cookies with
   * the response from the server
   * as defined in the https://tools.ietf.org/html/rfc6265.
   *
   * @param {Cookies} cookies An Cookies object with newest cookies.
   * @param {String|Array?} copyKeys If set, it will try copy values
   * for given keys from old object to the new one.
   */
  merge(cookies, copyKeys) {
    if (!cookies || !cookies.cookies || cookies.cookies.length === 0) {
      return;
    }
    if (!this.cookies || this.cookies.length === 0) {
      this.cookies = cookies.cookies;
      return;
    }
    const foreignDomain = cookies.uri ? cookies.uri.hostname : null;
    const foreignPath = cookies.url ? this._getPath(cookies.url) : null;
    // delete cookies from this.cookies that has the same name as new ones,
    // but are domain/path match
    const newCookies = cookies.cookies;
    const nLength = newCookies.length;
    copyKeys = copyKeys ?
      copyKeys instanceof Array ? copyKeys : [copyKeys] : null;
    const copyKeysLength = copyKeys ? copyKeys.length : 0;
    for (let i = this.cookies.length - 1; i >= 0; i--) {
      const tName = this.cookies[i].name;
      for (let j = 0; j < nLength; j++) {
        const nName = newCookies[j].name;
        if (nName === tName) {
          if (!foreignDomain || !this._matchDomain(foreignDomain)) {
            // This is cookie for a different domain. Don't override.
            continue;
          }
          if (!foreignPath || !this._matchPath(foreignPath)) {
            // This is cookie for a different path. Don't override.
            continue;
          }
          const removed = this.cookies.splice(i, 1);
          newCookies[j].created = removed[0].created;
          if (copyKeys) {
            for (let k = 0; k < copyKeysLength; k++) {
              const key = copyKeys[k];
              if (key in removed[0]) {
                newCookies[j][key] = removed[0][key];
              }
            }
          }
          break;
        }
      }
    }
    // Do not re-set cookies that values are not set.
    for (let i = nLength - 1; i >= 0; i--) {
      const nValue = newCookies[i].value;
      if (!nValue || !nValue.trim || !nValue.trim()) {
        newCookies.splice(i, 1);
      }
    }
    this.cookies = this.cookies.concat(newCookies);
  }

  /**
   * Gets the path for a domain as defined in
   * https://tools.ietf.org/html/rfc6265#section-5.1.4
   *
   * @param {String} url A url to extract path from.
   * @return {String}
   */
  _getPath(url) {
    const defaultValue = '/';
    if (!url) {
      return defaultValue;
    }
    let index = url.indexOf('/', 8); // after `http(s)://` string
    if (index === -1) {
      return defaultValue;
    }
    url = url.substr(index);
    if (!url || url[0] !== '/') {
      return defaultValue;
    }
    // removed query string
    index = url.indexOf('?');
    if (index !== -1) {
      url = url.substr(0, index);
    }
    // removes hash string
    index = url.indexOf('#');
    if (index !== -1) {
      url = url.substr(0, index);
    }
    index = url.indexOf('/', 1);
    if (index === -1) {
      return defaultValue;
    }
    index = url.lastIndexOf('/');
    if (index !== 0) {
      url = url.substr(0, index);
    }
    return url;
  }

  /**
   * Checks if paths mach as defined in
   * https://tools.ietf.org/html/rfc6265#section-5.1.4
   *
   * Note: This function will return false if the `this.url` was not set.
   *
   * @param {String} cookiePath Path from the cookie.
   * @return {Boolean} True when paths matches.
   */
  _matchPath(cookiePath) {
    if (!this.uri) {
      return false;
    }
    if (!cookiePath) {
      return true;
    }
    const hostPath = this._getPath(this.url);
    if (hostPath === cookiePath) {
      return true;
    }
    // const index = cookiePath.indexOf(hostPath);
    const index = hostPath.indexOf(cookiePath);
    if (index === 0 && cookiePath[cookiePath.length - 1] === '/') {
      return true;
    } else if (index === 0 && cookiePath.indexOf('/', 1) === -1) {
      return true;
    }

    if (index === 0) {
      for (let i = 0, len = hostPath.length; i < len; i++) {
        if (cookiePath.indexOf(hostPath[i]) === -1 && hostPath[i] === '/') {
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Checks if `domain` of the request url (defined as `this.url`)
   * matches domain defined in a cookie.
   * This follows algoritm defined in https://tools.ietf.org/html/rfc6265#section-5.1.3
   *
   * Note: If `cookieDomain` is not set it returns false, while
   * (according to the spec) it should be set to `domain` and pass the test.
   * Because this function only check if domains matches it will not
   * override domain.
   * Cookie domain should be filled before calling this function.
   *
   * Note: This function will return false if the `this.url` was not set.
   *
   * @param {String} cookieDomain A domain received in the cookie.
   * @return {Boolean} True if domains matches.
   */
  _matchDomain(cookieDomain) {
    if (!this.uri) {
      return false;
    }
    let domain = this.uri.hostname;
    domain = domain && domain.toLowerCase && domain.toLowerCase();
    cookieDomain = cookieDomain && cookieDomain.toLowerCase &&
      cookieDomain.toLowerCase();
    if (!cookieDomain) {
      return false;
    }
    if (domain === cookieDomain) {
      return true;
    }
    if (cookieDomain[0] === '.') {
      const parts = domain.split('.');
      if (parts.length > 1) {
        parts.shift();
        domain = parts.join('.');
      }
    }
    const index = cookieDomain.indexOf(domain);
    if (index === -1) {
      return false;
    }
    if (cookieDomain.substr(index - 1, index) !== '.') {
      return false;
    }
    return true;
  }
  /**
   * Clears cookies from `this.cookies` that already expired.
   *
   * @return {Array<Cookie>} List of removed (expired) cookies.
   */
  clearExpired() {
    const now = Date.now();
    const expired = [];
    const cookies = this.cookies.filter((cookie) => {
      if (!cookie.expires) {
        return true;
      }
      if (now >= cookie.expires) {
        expired.push(cookie);
        return false;
      }
      return true;
    });
    this.cookies = cookies;
    return expired;
  }
}
