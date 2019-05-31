[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/cookie-parser.svg)](https://www.npmjs.com/package/@advanced-rest-client/cookie-parser)

[![Build Status](https://travis-ci.org/advanced-rest-client/cookie-parser.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/cookie-parser)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/cookie-parser)

# cookie-parser

A JavaScript cookie parser for HTTP clients.
Works in the browser as ES6 module or in node.

```javascript
import {Cookies} from './node_modules/@advanced-rest-client/cookie-parser/cookie-parser.js';
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

In node:

```javascript
const {Cookies} = require('@advanced-rest-client/cookie-parser');
const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
console.log(parser.cookies);
```

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @advanced-rest-client/cookie-parser
```

### In an html file

```html
<html>
  <head></head>
  <body>
    <script>
    import {Cookies} from './node_modules/@advanced-rest-client/cookie-parser/cookie-parser.js';
    const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
    console.log(parser.cookies);
    </script>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from './node_modules/@polymer/polymer';
import {Cookies} from './node_modules/@advanced-rest-client/cookie-parser/cookie-parser.js';

class SampleElement extends PolymerElement {
  static get cookies() {
    const parser = new Cookies('rememberme=1; domain=foo.com; path=/; ssid=Hy1t5e#oj21.876aak;', 'http://bar.com/');
    return parser.cookies;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/cookie-parser
cd api-url-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```
