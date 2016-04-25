# Cookie parser
A cookie parser for JavaScript HTTP clients written in ES6.

This library is a part of the [Advanced Rest Client] project.

## Getting started
Bower the library
```
bower install jarrodek/cookie-parser
```
And import it into your project using web components.
```html
<link rel="import" href="bower-components/cookie-parser/cookie-parser.html">
```
Now you can use the following classes:
* Cookie
* Cookies

## usage

The **Cookie** class represents a single cookie object. The **Cookies** class represents a Cookies
collection and parser.

### Parsing cookies received from server
Let say you received a value for `Set-Cookie` header. For example:

```
rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;
```

Then you can parse this value to cookies array using the `Cookies` class:
```javascript
var parser = new Cookies(httpHeaderStr);
```
Now the `parser.cookies` property will contain a list of 2 cookies:
* Cookie `rememberme` with value `1`, domain set to `foo.com` and path set to `/`.
* Cookie `ssid` with value `Hy1t5e#oj21.876aak` only.

If you not planing to do any operation on parsed cookies you can use a shortcut function:
```
var cookies = Cookies.parse(httpHeaderStr);
```

You can easily transform parser object to the HTTP string again using `toStrnig()` function:

```javascript
var cookieStr = parser.toString();
```
The `cookieStr` will back to the `rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;` string again.

There is a difference if you'd like to send cookies from server to client and client > server. Server expects only name=value pairs where clients can accept more attributes.
The `toString()` function can take one boolean attribute. If this attribute is truly then the returned string will only contain headers as a name=value pairs.
From the example above, it will produce string as follows:
```javascript
var cookieStr = parser.toString(true);
// rememberme=1; ssid=Hy1t5e#oj21.876aak
```

You can set any cookie property by just assigning it's value:
```javascript
parser.cookies[1].domain = 'bar.com';
```

## Operations on cookies
If you need to perform any operation on cookies like filtering or merging, the `url` parameter for Cookies object must be set.
The URL is a request URL (or base url) for the cookies. Most operations on cookies depends on the URL of the client (for example browser).
For example, according to the [spec] the `domain` attribute for the cookie should be set by client if not set by the server. To be able to perform this operation parser needs to know what is the URL of the request.

So to perform any operation construct a parser object like this:
```javascript
var parser = new Cookies(httpHeaderStr, 'http://bar.com/path');
```
In this scenario parsed cookies will have different properties:
* Cookie `rememberme` with value `1`, domain set to `foo.com` and path set to `/`.
* Cookie `ssid` with value `Hy1t5e#oj21.876aak`, domain set to `bar.com` and path set to `/`.

Why second cookie has `/` path instead of `/path`? Because, according to the [spec], it is the same path. If the url's path would be a `/path/foo` then the `path` attribute would be `/path`

### Filtering not domain-match or not path-match
As you can see in the cookies above, the first cookie do not match the domain of the request. Clients are obligated to remove such cookies. For this with help comes a `filter()` function.

```javascript
var removed = parser.filter();
```
This function will result with empty list if the URL is not set.
The `removed` array will contain a list of cookies that do not match current URL. `parser.cookies` will now only contains a cookies that match the domain and path.

### Filtering expired cookies
Similar to above, you can use `clearExpired()` function:
```javascript
var removed = parser.clearExpired();
```

## Merging cookies
There is an algorithm in the [spec] about how to handle incoming cookie if the client already have matched cookie. Use `merge()` function for that.
Let say you have `cookies` and `newCookies` object. The `newCookies` object represents a cookies that are newer than `cookies` (which e.g. comes from the client's database). You can set new cookies in `cookies` array by calling `merge()`:

```javascript
parser.merge(newCookies);
```
After calling this function:
* All cookies that the name from new cookies exists in old cookies are removed from old cookies list
* All new cookies that don't have a value (which is a "remove cookie" action) and exists in old list are removed from new list
* New cookies are added to the old list
* The `created` attribute (as defined in the [spec]) is copied from removed old cookies to new cookies.

# License
Whole [Advanced Rest Client] and related libraries is open source under Apache 2.0 license.

  [spec]: https://tools.ietf.org/html/rfc6265
  [Advanced Rest Client]: https://github.com/jarrodek/ChromeRestClient
