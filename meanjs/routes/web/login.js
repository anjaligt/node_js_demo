'use strict';

var config = require('../../config/config');
var common = require('../../lib/common');
var bcrypt = require('bcrypt');

exports.index = function(req, res) {
  if (req.cookies.fftoken === common.generateToken(config.username, config.password)) {
    res.redirect('/teachers');
  } else {
    res.render('index', { error: false });
  }
};

exports.login = function (req, res) {

  var username = req.body.username ? req.body.username.trim() : '';
  var password = req.body.password ? req.body.password.trim() : '';

  var hasMatched = bcrypt.compareSync(password, config.password);

  if (config.username === username && hasMatched) {
    res.json({  success: true, data: [], message: 'Login successfully.'});
    //res.cookie('fftoken', common.generateToken(username, config.password));
   // res.redirect('/teachers');
  } else {
     res.json({  success: false, data: [], message: 'Invalid username or password.' });
   // res.render('index', {error: 'Wrong Username or Password!'});
  }
};

exports.logout = function(req, res) {
  res.clearCookie('fftoken');
  res.redirect('/');
};