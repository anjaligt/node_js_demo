'use strict';

var debug = require('debug')('ff:response');

exports = module.exports = function response(req, res, next) {
  debug('attaching `response` to the `res` object');

  res.response = res.response || {};
  next();
};