import { assert } from '@open-wc/testing';
import { Cookies } from '../cookie-parser.js';

describe('Cookies', function() {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';
  const baseUrl = 'http://bar.com/';

  describe('constructor()', () => {
    it('sets default cookie value', () => {
      const instance = new Cookies(undefined, baseUrl);
      assert.lengthOf(instance.cookies, 0);
    });

    it('sets cookie http string', () => {
      const instance = new Cookies(httpStr, baseUrl);
      assert.lengthOf(instance.cookies, 2);
    });

    it('sets url', () => {
      const instance = new Cookies(httpStr, baseUrl);
      assert.equal(instance.url, baseUrl);
    });
  });

  describe('get()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies(httpStr, baseUrl);
    });

    it('returns a cookie by name', () => {
      const c1 = instance.get('rememberme');
      assert.equal(c1.value, '1');
      const c2 = instance.get('ssid');
      assert.equal(c2.value, 'Hy1t5e#oj21.876aak');
    });

    it('returns undefined when no cookie', () => {
      const c1 = instance.get('not-exists');
      assert.notOk(c1);
    });
  });

  describe('set()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies(httpStr, baseUrl);
    });

    it('adds a new cookie', () => {
      instance.set('x-new', 'value');
      assert.lengthOf(instance.cookies, 3);
    });

    it('updates existing cookie', () => {
      instance.set('rememberme', '0');
      assert.lengthOf(instance.cookies, 2);
      assert.equal(instance.cookies[1].value, '0');
    });
  });

  describe('_matchDomain()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies();
    });

    it('returns false when no url', () => {
      assert.isFalse(instance._matchDomain('.api.com'));
    });

    it('returns false when no argument', () => {
      instance.url = baseUrl;
      assert.isFalse(instance._matchDomain(''));
    });

    it('returns true when domain are the same', () => {
      instance.url = baseUrl;
      assert.isTrue(instance._matchDomain('bar.com'));
    });

    it('returns true when dot in argument and url is subdomain', () => {
      instance.url = 'http://test.bar.com/';
      assert.isTrue(instance._matchDomain('.bar.com'));
    });

    it('returns false when dot in argument and url is deep subdomain', () => {
      instance.url = 'http://other.test.bar.com/';
      assert.isFalse(instance._matchDomain('.bar.com'));
    });
  });

  describe('_matchPath()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies();
    });

    it('returns false when no url', () => {
      assert.isFalse(instance._matchPath('/'));
    });

    it('returns true when no argument', () => {
      instance.url = baseUrl;
      assert.isTrue(instance._matchPath(''));
    });

    it('returns true when paths are the same', () => {
      instance.url = baseUrl;
      assert.isTrue(instance._matchPath('/'));
    });

    it('returns true when URL has single separator', () => {
      instance.url = baseUrl + 'test';
      assert.isTrue(instance._matchPath('/'));
    });

    it('returns true when URL has deep path that is a match', () => {
      instance.url = baseUrl + 'test/other';
      assert.isTrue(instance._matchPath('/'));
    });

    it('returns false when argument path is different', () => {
      instance.url = baseUrl + 'test/other';
      assert.isFalse(instance._matchPath('/other'));
    });

    it('returns false when argument path is is higher', () => {
      instance.url = baseUrl + '/other';
      assert.isFalse(instance._matchPath('/other/xyz'));
    });
  });

  describe('_getPath()', () => {
    let instance;
    beforeEach(() => {
      instance = new Cookies();
    });

    it('returns default value when no argument', () => {
      const result = instance._getPath();
      assert.equal(result, '/');
    });

    it('returns default value when no absolute URL', () => {
      const result = instance._getPath('api.com');
      assert.equal(result, '/');
    });

    it('returns default value when no path after separator domain', () => {
      const result = instance._getPath('https://api.com');
      assert.equal(result, '/');
    });

    it('returns default value when no domain and path', () => {
      const result = instance._getPath('https:///');
      assert.equal(result, '/');
    });

    it('returns default value when no path after domain', () => {
      const result = instance._getPath('https://api.com/');
      assert.equal(result, '/');
    });

    it('returns path value', () => {
      const result = instance._getPath('https://api.com/api/test/ignore');
      assert.equal(result, '/api/test');
    });

    it('ignores query string', () => {
      const result = instance._getPath('https://api.com/api/?a=b');
      assert.equal(result, '/api');
    });

    it('ignores hash part of the url', () => {
      const result = instance._getPath('https://api.com/api/#access_token=...');
      assert.equal(result, '/api');
    });
  });
});
