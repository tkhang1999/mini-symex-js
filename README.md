# mini-symex-js

A mini symbolic execution engine written in JavaScript, to illustrate some basic ideas of symbolic execution for beginners.

This work is inspired by [mini-mc](http://github.com/xiw/mini-mc) and [mini-symex](https://github.com/foreverbell/mini-symex).

## How to run?

1. Prerequisites

Make sure to have `python3`, `python3-disutils`, and `make` installed on your MacOS/Linux machine. Otherwise, the installation of `z3javascript` may fail.

2. Install dependencies

```sh
$ cd mini-symex-js
$ npm install --loglevel verbose # this may take a while to complete
$ cd node_modules/z3javascript
$ npm run prepublish
```

3. Run demo

```sh
$ cd mini-symex-js
$ npm run symbolic
$ npm run concolic
```
