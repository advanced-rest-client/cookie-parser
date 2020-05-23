[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/cookie-parser.svg)](https://www.npmjs.com/package/@advanced-rest-client/cookie-parser)

[![Build Status](https://travis-ci.com/advanced-rest-client/cookie-parser.svg)](https://travis-ci.com/advanced-rest-client/cookie-parser)

# cookie-parser

A JavaScript cookie parser for HTTP clients. Works in the browser as ES6 module or in NodeJS.

```javascript
import { Cookies } from '@advanced-rest-client/cookie-parser';
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

In Node:

```javascript
const {Cookies} = require('@advanced-rest-client/cookie-parser');
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

## Usage

### Installation
```
npm install --save @advanced-rest-client/cookie-parser
```

### Parsing cookie header

It parses `set-cookie` header received from the server and produces a Cookie object.

```javascript
import { Cookies } from '@advanced-rest-client/cookie-parser';
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

which is equivalent to:

```javascript
const cookies = Cookies.parse('...');
```

### Manipulating cookies

The filter function filters out cookies that should not be considered for given URL. This is defined in [https://tools.ietf.org/html/rfc6265](https://tools.ietf.org/html/rfc6265).

```javascript
const instance = new Cookies('a=b; domain=foo.com; path=/;', 'http://sub.foo.com/');
const removed = instance.filter();
console.log(removed); // has the cookies because domain does not match
```

To clear expired cookies just call `clearExpired()` function.

```javascript
const instance = new Cookies('a=b; expires=0;', 'http://sub.foo.com/');
// wait a second here, then
const removed = instance.filter();
console.log(removed); // the cookie expired
```

## Development

```sh
git clone https://github.com/advanced-rest-client/cookie-parser
cd cookie-parser
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```
