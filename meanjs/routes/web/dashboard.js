'use strict';
var common = require('../../lib/common');
var config = require('../../config/config');

exports.checkCookie = function (req, res, next) {
  if (req.cookies.fftoken === common.generateToken(config.username, config.password)) {
    next();
  } else {
    res.clearCookie('token');
    res.redirect('/');
  }
};

exports.dashboard = function (req, res) {
  res.render('dashboard',  {home: true});
};