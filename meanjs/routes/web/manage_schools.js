'use strict';
var _       = require('underscore');
var utils   = require('../../lib/utils');

exports.render = function (req, res) {
  	var schools 	  = req.store.schools;
  	var schools_count = req.store.schools_count;
  	var district      = req.store.districts;
  	res.render('manage_schools', {
    	manage_schools: true,
    	data: schools,
    	schools_count:schools_count,
    	data1:district
  	});
};