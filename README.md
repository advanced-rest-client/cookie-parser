[![Build Status](https://travis-ci.org/advanced-rest-client/..svg?branch=master)](https://travis-ci.org/advanced-rest-client/.)  [![Dependency Status](https://dependencyci.com/github/advanced-rest-client/./badge)](https://dependencyci.com/github/advanced-rest-client/.)  

# cookie-parser

This element adds a Cookie and Cookies objects to global object (window);

The `Cookie` class represents a single cookie.

Example:
```javascript
var myCookie = new Cookie('cookieName', 'cookieValue', {
  'max-age': 15
});
```
The constructor accepts 3 parameters: 1) cookie name, 2) cookie value, 3) all other cookie options
as an object as defined in cookies RFC (e.g. path, httpOnly, ..).
Cookie instance has `toHeader()` function which returns a string with a cookie value as a header
value.

The `Cookies` class parses cookies and manages its state.
```javascript
var parser = new Cookies('a=1; maxAge=15', 'https://mulesoft.com');
```
Parser takes two arguments: 1) Cookie string from the server response, 2) the URL for which the
cookie was set. It is importnat to provide correct URL in order to handle cookies properly.

Parser can be run directly by calling static function `Cookies.parse(cookieString)`. The result
is a list of `Cookie` objects.

The `filter()` function that can be called on `Cookies` instance will remove cookies that are
set for different domain and path.
This function has no effect if the URL in the constructor was not set.

The instance `merge()` function merges its cookies with another `Cookies` object.
This cookies will be overwritten by passed cookies according to the HTTP spec.
This function is useful when you need to override cookies with the response from the server
as defined in the https://tools.ietf.org/html/rfc6265.

The `clearExpired()` fucntion from the `Cookies` instance will remove cookies that are
removed by the server or are expired.

