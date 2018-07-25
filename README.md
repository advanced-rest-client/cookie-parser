[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/cookie-parser)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/cookie-parser)

# cookie-parser

A javascript cookie parser for javascript HTTP clients.
The component is inly include wrapper for the library.

```html
<link rel="import" href="../cookie-parser/cookie-parser.html">
```

```javascript
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

### API components

This components is a part of API components ecosystem: https://elements.advancedrestclient.com/
