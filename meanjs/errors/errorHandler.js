'use strict';

var debug = require('debug')('ff:apierr');
var BadRequest = require('./errors').BadRequest;
var Unauthorized = require('./errors').Unauthorized;
var Forbidden = require('./errors').Forbidden;
var NotFound = require('./errors').NotFound;

/* jshint -W098 */
exports = module.exports = function errorHandler(err, req, res, next) {

  if (err instanceof BadRequest) {
    res.status(400);
  } else if (err instanceof NotFound) {
    res.status(404);
  } else if (err instanceof Forbidden) {
    res.status(403);
  } else if (err instanceof Unauthorized) {
    res.status(401);
  } else {
    res.status(500);
    res.response.message = 'Internal Server Error';
  }

  res.response.code = err.code || 0;
  if (!res.response.message) {
    res.response.message = err.message || 'An error occurred';
  }

  debug(err);

  res.json(res.response);
};