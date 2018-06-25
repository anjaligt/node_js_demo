'use strict';
var _       = require('underscore');
var utils   = require('../../lib/utils');

exports.render = function (req, res) {
  var districts 		= req.store.counties;
  var counties_count 	= req.store.counties_count;
  res.render('management', {
    management: true,
    data: districts,
    counties_count:counties_count
  });
};