const assert = require('chai').assert;
const {Cookies} = require('../');

describe('Parse cookies', function() {
  let httpStr = 'rememberme=1; domain=foo.com;';
  httpStr += ' path=/; ssid=Hy1t5e#oj21.876aak;';

  it('should parse empty string', function() {
    const cookieStr = '';
    const parser = new Cookies(cookieStr);
    assert.typeOf(parser.cookies, 'array');
    assert.equal(parser.cookies, '');
  });

  it('should parse basic Set-Cookie string', function() {
    const parser = new Cookies('cookie=value');
    assert.typeOf(parser.cookies, 'array');
    assert.lengthOf(parser.cookies, 1);
    assert.equal(parser.cookies[0].name, 'cookie');
    assert.equal(parser.cookies[0].value, 'value');
  });

  it('should parse Set-Cookie string', function() {
    const parser = new Cookies(httpStr);
    assert.typeOf(parser.cookies, 'array');
    assert.lengthOf(parser.cookies, 2);
  });

  it('should set cookie names', function() {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].name, 'rememberme');
    assert.equal(parser.cookies[1].name, 'ssid');
  });

  it('should set cookie values', function() {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].value, '1');
    assert.equal(parser.cookies[1].value, 'Hy1t5e#oj21.876aak');
  });

  it('should set domains and paths', function() {
    const parser = new Cookies(httpStr);
    assert.equal(parser.cookies[0].domain, 'foo.com');
    assert.equal(parser.cookies[0].path, '/');
    assert.isUndefined(parser.cookies[1].domain);
    assert.isUndefined(parser.cookies[1].path);
  });

  it('should set created and lastAccess properties', function() {
    const parser = new Cookies(httpStr);
    assert.typeOf(parser.cookies[0].created, 'number');
    assert.typeOf(parser.cookies[0].lastAccess, 'number');
  });

  it('should set expires from max-age', function() {
    const str = 'rememberme=1; domain=foo.com; path=/; max-age=100';
    const parser = new Cookies(str);
    const now = Date.now();
    const cookie = parser.cookies[0];
    assert.isAtLeast(cookie.expires, now + 100000);
    assert.isAtMost(cookie.expires, now + 101000);
    assert.isTrue(cookie.persistent,
      'The persistent flag is not set to true');
    cookie.maxAge = 0;
    assert.equal(parser.cookies[0].expires, -8640000000000000,
      'Do not set max date');
  });

  it('should set cookie header string', function() {
    const parser = new Cookies(httpStr);
    const c0clientStr = parser.cookies[0].toHeader();
    const c1clientStr = parser.cookies[1].toHeader();
    const clientStr = c0clientStr + '; ' + c1clientStr;
    assert.equal(parser.toString(), clientStr, 'Set-Cookie string is invalid');
    assert.equal(parser.toString(true),
      'rememberme=1; ssid=Hy1t5e#oj21.876aak',
      'Cookie string is invalid');
  });
});
