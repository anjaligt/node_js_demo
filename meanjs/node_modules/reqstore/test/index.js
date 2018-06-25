var express = require('express');
var http = require('http');
var assert = require('assert');
var reqstore = require('../reqstore');

var app = express();

app.use(reqstore());

app.get('/', function(req, res, next) {

  assert.strictEqual(typeof req.store, 'object', '`store` should be an object');
  assert.strictEqual(typeof req.store.get, 'function', '`store.get` should be a function');
  assert.strictEqual(typeof req.store.set, 'function', '`store.set` should be a function');
  assert.strictEqual(typeof req.store.remove, 'function', '`store.remove` should be a function');

  req.store.set('foo', 'bar');
  req.store.set({ beep: 'boop' });
  req.store.set({stuff: { foo: 'bar' }});
  req.store.set(null);
  req.store.set(Infinity);

  next();

}, function(req, res, next) {

  assert.strictEqual(req.store.get('foo'), 'bar', 'get should return saved value');
  assert.strictEqual(req.store.get('beep'), 'boop', 'get should resturn saved value');
  assert.strictEqual(typeof req.store.get(1), 'undefined', 'number can\'t be a key');
  assert.strictEqual(typeof req.store.get(0), 'undefined', '0 can\'t be a key');
  assert.strictEqual(typeof req.store.get(null), 'undefined', 'null can\'t be a key');
  assert.strictEqual(typeof req.store.get('stuff'), 'object', 'object values can be fetched');
  next();

}, function(req, res, next) {
  req.store.remove('foo');
  next();

}, function(req, res) {
  res.send(200);
});

var server = app.listen(3000, function() {
    http.get('http://localhost:3000', function(res) {
      server.close();
      process.exit();
    });
});