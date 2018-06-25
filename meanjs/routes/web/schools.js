'use strict';
var _ = require('underscore');

exports.render = function (req, res) {
  var schools = req.store.schools;
  var searchQuery = req.store.searchQuery;
  var districts = req.store.districts;
  var counties = req.store.counties;
  res.render('schools', {
    schools: true,
    searchQuery: searchQuery,
    data: schools,
    districts: districts,
    counties: counties
  });
};

exports.extractParams = function ( req, res, next ) {

  // since this function will only be called by an admin
  var schoolParameters;

  if (Object.keys(req.query).length === 0) {
    schoolParameters = req.body;
  } else {
    schoolParameters = req.query;
  }

  req.store.set('schoolParameters', schoolParameters);
  next();

};

exports.extractQuery = function ( req, res, next ) {

  var schoolParameters = req.store.get('schoolParameters');
  var query = schoolParameters.q;
  req.store.set('query', query);
  next();

};

/**
 * Extract school id
 */
exports.extractSchoolId = function ( req, res, next ) {
  var schoolId = req.params.id;

  if ( _.isUndefined(schoolId) ) {
    req.flash('error', 'School Id is required');
    return res.redirect('/schools');
  } else {
      req.store.set('schoolId', schoolId);
      next();
  }
};
