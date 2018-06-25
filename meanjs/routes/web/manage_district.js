'use strict';
var _       = require('underscore');
var utils   = require('../../lib/utils');

exports.render = function (req, res) {
  var districts 		= req.store.districts;
  var districts_count 	= req.store.districts_count;
  var counties			= req.store.counties;
  res.render('manage_district', {
    manage_district: true,
    data: districts,
    districts_count:districts_count,
    data1:counties
  });
};