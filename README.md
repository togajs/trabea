**NOTE: This project is under active development. APIs subject to change.**

# `trabea`

[![NPM version][npm-img]][npm-url] [![Downloads][downloads-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Chat][gitter-img]][gitter-url] [![Tip][amazon-img]][amazon-url]

A base compiler for [Toga](http://togajs.github.io) documentation. Takes abstract syntax trees and generates the final documenation output.

## Install

    $ npm install --save-dev trabea

## API

### `new Trabea([options])`

- `options` `{Object}`

Creates a reusable theme engine based on the given options.

### `#pipe(stream) : Stream.Readable`

- `stream` `{Stream.Writable}` - Writable stream.

Trabea is a [Transform Stream](http://nodejs.org/api/stream.html#stream_class_stream_transform), working in object mode. ASTs stored in the `.ast` property of [Vinyl](https://github.com/wearefractal/vinyl) objects are passed into theme templates to generate the final file contents.

## Example

```js
var toga = require('toga'),
    Trabea = require('trabea');

toga.src('./lib/**/*.js')
    // ... parser(s)
    // ... formatter(s)
    .pipe(new Trabea()) // takes `.ast` and generates final output
    .pipe(toga.dest('./docs'));
```

## Test

    $ gulp test

## Contribute

[![Tasks][waffle-img]][waffle-url]

Standards for this project, including tests, code coverage, and semantics are enforced with a build tool. Pull requests must include passing tests with 100% code coverage and no linting errors.

----

© 2015 Shannon Moeller <me@shannonmoeller.com>

Licensed under [MIT](http://shannonmoeller.com/mit.txt)

[amazon-img]:    https://img.shields.io/badge/amazon-tip_jar-yellow.svg?style=flat-square
[amazon-url]:    https://www.amazon.com/gp/registry/wishlist/1VQM9ID04YPC5?sort=universal-price
[coveralls-img]: http://img.shields.io/coveralls/togajs/trabea/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/togajs/trabea
[downloads-img]: http://img.shields.io/npm/dm/trabea.svg?style=flat-square
[gitter-img]:    http://img.shields.io/badge/gitter-join_chat-1dce73.svg?style=flat-square
[gitter-url]:    https://gitter.im/togajs/toga
[npm-img]:       http://img.shields.io/npm/v/trabea.svg?style=flat-square
[npm-url]:       https://npmjs.org/package/trabea
[travis-img]:    http://img.shields.io/travis/togajs/trabea.svg?style=flat-square
[travis-url]:    https://travis-ci.org/togajs/trabea
[waffle-img]:    http://img.shields.io/github/issues/togajs/trabea.svg?style=flat-square
[waffle-url]:    http://waffle.io/togajs/trabea
