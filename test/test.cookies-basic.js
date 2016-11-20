/* global describe, it, before */
const expect = require('chai').expect;
const cp = require('../cookie-parser.js');

describe('Cookie parser - basics', function() {
  var httpStr = 'rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;';
  var baseUrl = 'http://bar.com/';
  // setup(function() {});

  describe('Parse cookies - basics', function() {
    it('should parse empty string', function() {
      var cookieStr = '';
      var parser = new cp.Cookies(cookieStr);
      expect(parser.cookies).to.be.a('array');
      expect(parser.cookies).to.be.empty;
    });

    it('should parse basic Set-Cookie string', function() {
      var parser = new cp.Cookies('cookie=value');
      expect(parser.cookies).to.be.a('array');
      expect(parser.cookies).to.have.lengthOf(1);
      expect(parser.cookies[0].name).to.equal('cookie');
      expect(parser.cookies[0].value).to.equal('value');
    });

    it('should parse Set-Cookie string', function() {
      var parser = new cp.Cookies(httpStr);
      expect(parser.cookies).to.be.a('array');
      expect(parser.cookies).to.have.lengthOf(2);
    });

    it('should set cookie names', function() {
      var parser = new cp.Cookies(httpStr);
      expect(parser.cookies[0].name).to.equal('rememberme');
      expect(parser.cookies[1].name).to.equal('ssid');
    });

    it('should set cookie values', function() {
      var parser = new cp.Cookies(httpStr);
      expect(parser.cookies[0].value).to.equal('1');
      expect(parser.cookies[1].value).to.equal('Hy1t5e#oj21.876aak');
    });

    it('should set domains and paths', function() {
      var parser = new cp.Cookies(httpStr);
      expect(parser.cookies[0].domain).to.equal('foo.com');
      expect(parser.cookies[0].path).to.equal('/');
      expect(parser.cookies[1].domain).to.not.exist;
      expect(parser.cookies[1].path).to.not.exist;
    });

    it('should set created and lastAccess properties', function() {
      var parser = new cp.Cookies(httpStr);
      expect(parser.cookies[0].created).to.be.a('number');
      expect(parser.cookies[0].lastAccess).to.be.a('number');
    });

    it('should set expires from max-age', function() {
      var str = 'rememberme=1; domain=foo.com; path=/; max-age=100';
      var parser = new cp.Cookies(str);
      var now = Date.now();
      var cookie = parser.cookies[0];
      expect(cookie.expires).to.be.within(now + 100000, now + 101000);
      expect(cookie.persistent).to.equal(true, 'The persistent flag is not set to true');
      cookie.maxAge = 0;
      expect(parser.cookies[0].expires).to.equal(-8640000000000000, 'Do not set max date');
    });

    it('should set cookie header string', function() {
      var parser = new cp.Cookies(httpStr);
      var c0clientStr = parser.cookies[0].toHeader();
      var c1clientStr = parser.cookies[1].toHeader();
      var clientStr = c0clientStr + '; ' + c1clientStr;
      expect(parser.toString()).to.equal(clientStr, 'Set-Cookie string is invalid');
      expect(parser.toString(true)).to.equal('rememberme=1; ssid=Hy1t5e#oj21.876aak',
        'Cookie string is invalid');
    });
  });

  describe('Parse cookies - with the url', function() {
    this.timeout(2500);

    it('should set empty cookie\'s attributes domain and path', function() {
      var parser = new cp.Cookies(httpStr, baseUrl);
      var cookie = parser.cookies[1];
      expect(cookie.domain).to.equal('bar.com', 'Do not set cookie domain');
      expect(cookie.path).to.equal('/', 'Do not set cookie path');
    });
    it('should remove not matched cookies', function() {
      var parser = new cp.Cookies(httpStr, baseUrl);
      var removed = parser.filter();
      expect(parser.cookies).to.have.lengthOf(1);
      expect(removed).to.be.a('array');
      expect(removed).to.have.lengthOf(1);
      expect(removed[0].name).to.equal('rememberme');
    });
    it('should not remove not expired cookies', function() {
      var parser = new cp.Cookies(httpStr, baseUrl);
      var removed = parser.clearExpired();
      expect(parser.cookies).to.have.lengthOf(2,
        'Removed not expired cookie');
      expect(removed).to.be.a('array', 'Removed should be an array');
      expect(removed).to.have.lengthOf(0, 'Removed should be an empty array');
    });
    it('should remove expired cookies set by `expires`', function() {
      var str = httpStr + ' expires=' + new Date(Date.now() - 100).toUTCString();
      var parser = new cp.Cookies(str, baseUrl);
      var removed = parser.clearExpired();
      expect(parser.cookies).to.have.lengthOf(1,
        'Did not removed expired cookie set by `expires` attribute');
      expect(removed).to.be.a('array');
      expect(removed).to.have.lengthOf(1);
      expect(removed[0].name).to.equal('ssid');
    });

    it('should remove expired cookies set by `max-age`', function(done) {
      var str = httpStr + ' max-age=1';
      var parser = new cp.Cookies(str, baseUrl);
      setTimeout(function() {
        var removed = parser.clearExpired();
        expect(parser.cookies).to.have.lengthOf(1,
          'Did not removed expired cookie set by `max-age` attribute');
        expect(removed).to.be.a('array');
        expect(removed).to.have.lengthOf(1);
        expect(removed[0].name).to.equal('ssid');
        done();
      }, 1200);
    });
  });

  describe('Merge cookies', function() {
    var pastCookies;
    before(function(done) {
      // creation date of this cookies will be in the past.
      pastCookies = new cp.Cookies(httpStr, baseUrl);
      setTimeout(function() {
        done();
      }, 1000);
    });
    it('should merge when no old cookies', function() {
      var oldParser = new cp.Cookies('', baseUrl);
      var newParser = new cp.Cookies(httpStr, baseUrl);
      oldParser.merge(newParser);
      expect(oldParser.cookies).to.have.lengthOf(2,
        'New cookies were not set');
    });

    it('should merge when no new cookies, no old cookies', function() {
      var oldParser = new cp.Cookies('', baseUrl);
      var newParser = new cp.Cookies('', baseUrl);
      oldParser.merge(newParser);
      expect(oldParser.cookies).to.have.lengthOf(0);
    });

    it('should merge when no new cookies', function() {
      var oldParser = new cp.Cookies(httpStr, baseUrl);
      var newParser = new cp.Cookies('',baseUrl);
      oldParser.merge(newParser);
      expect(oldParser.cookies).to.have.lengthOf(2,
        'New cookies were not set');
    });

    it('should merge different cookies', function() {
      var oldParser = new cp.Cookies(httpStr, baseUrl);
      var newParser = new cp.Cookies('test=value', baseUrl);
      oldParser.merge(newParser);
      expect(oldParser.cookies).to.have.lengthOf(3,
        'New cookies were not set');
    });

    it('should merge same cookies', function() {
      var oldCookieCreationTime = pastCookies.cookies[1].created;
      var oldCookieLastAccessTime = pastCookies.cookies[1].lastAccess;
      var newParser = new cp.Cookies('ssid=abc', baseUrl);
      pastCookies.merge(newParser);
      expect(pastCookies.cookies).to.have.lengthOf(2,
        'Old cookie wans not replaced');
      expect(pastCookies.cookies[1].created).to.equal(oldCookieCreationTime,
        'New cookie should have old\'s creation time');
      expect(pastCookies.cookies[1].lastAccess).to.not.equal(oldCookieLastAccessTime,
        'New cookie should not have old\'s last access time');
    });

    it('should have new cookie value', function() {
      var oldParser = new cp.Cookies(httpStr, baseUrl);
      var newParser = new cp.Cookies('ssid=abc', baseUrl);
      oldParser.merge(newParser);
      expect(oldParser.cookies[1].value).to.equal('abc');
    });
  });
});
