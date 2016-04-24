(function() {
  'use strict';
  /*******************************************************************************
   * Copyright 2016 Pawel Psztyc, The ARC team
   *
   * Licensed under the Apache License, Version 2.0 (the "License"); you may not
   * use this file except in compliance with the License. You may obtain a copy of
   * the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
   * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
   * License for the specific language governing permissions and limitations under
   * the License.
   ******************************************************************************/

  var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

  /**
   * A Cookie object.
   * It is based on https://github.com/pillarjs/cookies/blob/master/lib/cookies.js
   */
  class Cookie {
    /**
     * Constructs a new cookie.
     *
     * @param {Stirng} name Cookie name
     * @param {Stirng} value Cookie value
     * @param {Object} attrs Additional cookie attributes.
     */
    constructor(name, value, attrs) {
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError('Argument `name` is invalid');
      }
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError('Argument `value` is invalid');
      }

      if (this.path && !fieldContentRegExp.test(this.path)) {
        throw new TypeError('Option `path` is invalid');
      }

      if (this.domain && !fieldContentRegExp.test(this.domain)) {
        throw new TypeError('Option `domain` is invalid');
      }

      if (!value) {
        this.expires = new Date(0);
      }

      this.name = name;
      this.value = value || '';
      for (let key in attrs) {
        this[key] = attrs[key];
      }
    }

    toString() {
        return this.name + '=' + this.value;
      }
      /**
       * Returns a Cookie as a HTTP header string.
       */
    toHeader() {
      var header = this.toString();
      if (this.expires && !(this.expires instanceof Date)) {
        this.expires = new Date(this.expires);
        if (this.expires.toString() === 'Invalid Date') {
          this.expires = new Date(0);
        }
      }

      if (this.path) {
        header += '; path=' + this.path;
      }
      if (this.expires) {
        header += '; expires=' + this.expires.toUTCString();
      }
      if (this.domain) {
        header += '; domain=' + this.domain;
      }
      if (this.httpOnly) {
        header += '; httpOnly=' + this.httpOnly;
      }
      return header;
    }
  }

  /**
   * A library to handle Cookie parsing.
   * It is based on https://github.com/pillarjs/cookies/blob/master/lib/cookies.js
   */
  class Cookies {
    /**
     * Constructs an object.
     *
     * @param {String?} cookie A HTTP cookie strig to parse.
     * @param {String?} url A request url for this object. If empty some cookie computations
     * (like checking if cookies match) will be omnited.
     */
    constructor(cookie, url) {
      if (!cookie) {
        cookie = '';
      }
      /**
       * A HTTP cookie string.
       *
       * @type String
       */
      this._cookie = cookie;
      /**
       * A list of parsed cookies.
       *
       * @type {Array<Cookie>}
       */
      this.cookies = this.parse(cookie);
      /**
       * Cached RegExp objects.
       *
       * @type RegExp
       */
      this.cache = {};
      /**
       * A base URL for this object.
       *
       * @type {String}
       */
      this.url = url;
    }

    set url(url) {
      if (url) {
        this._url = url;
        this.uri = new URI(this.url);
      } else {
        this._url = undefined;
        this.uri = undefined;
      }
    }

    get url() {
      return this._url;
    }

    parse(cookies) {
      var cookieParts = ['path', 'domain', 'max-age', 'expires', 'secure', 'httponly'];
      var list = [];
      if (!cookies || !cookies.trim()) {
        return list;
      }
      cookies.split(/;/).map((cookie) => {
        let parts = cookie.split(/=/, 2);
        if (parts.length === 0) {
          return;
        }
        let name = decodeURIComponent(parts[0].trim()).toLowerCase();
        if (!name) {
          return;
        }
        let value = parts.length > 1 ? decodeURIComponent(parts[1].trim()) : null;
        if (cookieParts.indexOf(name.toLowerCase()) !== -1) {
          if (list.length - 1 >= 0) {
            list[list.length - 1][name] = value;
          }
        } else {
          list.push(new Cookie(name, value));
        }
      });
      return list;
    }

    /**
     * Get a cookie by name.
     *
     * @param {String} name Cookie name
     * @return {Cookie} A Cookie object or null.
     */
    get(name) {
      if (!name || !this._cookie) {
        return null;
      }
      var match = this._cookie.match(this.getPattern(name));
      if (!match) {
        return null;
      }
      var value = match[1];

      return value;
    }
    /**
     * Adds a cookie to the list of cookies.
     *
     * @param {String} name Name of the cookie.
     * @param {String} value Value of the cookie.
     * @param {Object<String, String>} opts Other cookie options to set.
     */
    set(name, value, opts) {
      var cookie = new Cookie(name, value, opts);
      var cookies = this.cookies.filter((c) => c.indexOf(cookie.name + '=') !== 0);
      cookies.push(cookie.toHeader());
      this.cookies = cookies;
      this._cookie = cookies.join('; ');
    }
    // returns (and cache) regexp for cookie to search for.
    getPattern(name) {
      if (this.cache[name]) {
        return this.cache[name];
      }
      this.cache[name] = new RegExp('(?:^|;) *' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') +
        '=([^;]*)');
      return this.cache[name];
    }

    toHeader() {
      return this.cookies.join('; ');
    }
    /**
     * Remove cookies from `this.cookies` that has been set for different domain.
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
      var domain = this.uri.domain();
      if (!domain) {
        return [];
      } else {
        domain = domain.toLowerCase();
      }
      var path = this._getPath(this.url);
      var removed = [];
      var validCookies = this.cookies.filter((cookie) => {
        if (!cookie.path) {
          cookie.path = path;
        }
        let cDomain = cookie.domain;
        if (!cDomain) {
          cookie.domain = domain;
          // point 6. of https://tools.ietf.org/html/rfc6265#section-5.3
          cookie.hostOnly = true;
          return true;
        }
        var res = this._matchDomain(cDomain);
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
     * This cookies will be overwritten by passed cookies according to the HTTP spec.
     * This function is useful when you need to override cookies with the response from the server
     * as defined in the https://tools.ietf.org/html/rfc6265.
     *
     * @param {Cookies} cookies An Cookies object with newest cookies.
     */
    merge(cookies) {
      if (!cookies || !!cookies.cookies || cookies.cookies.length === 0) {
        return;
      }
      if (!this.cookies || this.cookies.length === 0) {
        this.cookies = cookies;
        return;
      }
      // delete cookies from this.cookies that has the same name as new ones
      var tLength = this.cookies.length;
      var newCookies = cookies.cookies;
      var nLength = newCookies.length;
      for (var i = tLength; i >= 0; i--) {
        var tName = this.cookies[i].name;
        for (var j = 0; j < nLength; j++) {
          var nName = newCookies[j].name;
          if (nName === tName) {
            this.cookies.splice(i, 1);
            break;
          }
        }
      }
      // Do not re-set cookies that values are not set.
      for (i = nLength; i >= 0; i--) {
        var nValue = newCookies[i].value;
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
     */
    _getPath(url) {
      if (!url) {
        return '/';
      }
      var index = url.indexOf('/', 8); //after `http(s)://` string
      if (index === -1) {
        return '/';
      }
      url = url.substr(index);
      if (!url || url[0] !== '/') {
        return [];
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
        return '/';
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
      var hostPath = this._getPath(this.url);
      if (hostPath === cookiePath) {
        return true;
      }
      var index = cookiePath.indexOf(hostPath);
      if (index === 0 && cookiePath[cookiePath.length - 1] === '/') {
        return true;
      }

      if (index === 0) {
        for (var i = 0, len = hostPath.length; i < len; i++) {
          if (cookiePath.indexOf(hostPath[i]) === -1 && hostPath[i] === '/') {
            return true;
          }
        }
      }
      return false;
    }
    /**
     * Checks if `domain` of the request url (defined as `this.url`) matches domain defined in a
     * cookie.
     * This follows algoritm defined in https://tools.ietf.org/html/rfc6265#section-5.1.3
     *
     * Note: If `cookieDomain` is not set it returns false, while (according to the spec) it
     * should be set to `domain` and pass the test.
     * Because this function only check if domains matches it will not override domain.
     * Cookie domain should be filled before calling this function.
     *
     * Note: This function will return false if the `this.url` was not set.
     *
     * @param {String} domain A host domain
     * @param {String} cookieDomain A domain received in the cookie.
     * @return {Boolean} True if domains matches.
     */
    matchDomain(cookieDomain) {
      if (!this.uri) {
        return false;
      }
      var domain = this.uri.domain();
      domain = domain && domain.toLowerCase && domain.toLowerCase();
      cookieDomain = cookieDomain && cookieDomain.toLowerCase && cookieDomain.toLowerCase();
      if (!cookieDomain) {
        return false;
      }
      if (domain === cookieDomain) {
        return true;
      }
      let index = cookieDomain.indexOf(domain);
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
      var now = Date.now();
      var expired = [];
      var cookies = this.cookies.filter((cookie) => {
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

  window.Cookies = Cookies;
  window.Cookie = Cookie;

})();
