# mini-symex-js

A mini symbolic execution engine written in JavaScript, to illustrate some basic ideas of symbolic execution for beginners.

This work is inspired by [mini-mc](http://github.com/xiw/mini-mc) and [mini-symex](https://github.com/foreverbell/mini-symex). 

## How to run?

1. Install dependencies
```
$ npm install
$ cd node_modules/z3javascript
$ npm run prepublish
```
  
2. Run a simple example in `app.js`
```
$ npm run symbolic
```

## TODO
Implement a concolic execution engine.
