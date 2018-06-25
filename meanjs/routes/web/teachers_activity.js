'use strict';
// var Teachers = require('../web/teachers');
var _       = require('underscore');
var utils   = require('../../lib/utils');

exports.render = function(req, res) {
    var teachers    = req.store.teachers;
    var searchQuery = req.store.searchQuery;
    var districts   = req.store.districts;
    var counties    = req.store.counties;
    var normal_teacher_count    = req.store.normal_teacher_count;
    var admin_teacher_count     = req.store.admin_teacher_count;
    res.render('teachers_activity', {
        teachers_activity: true,
        searchQuery: searchQuery,
        data: teachers,
        districts: districts,
        counties: counties,
        normal_teacher_count: normal_teacher_count,
        admin_teacher_count: admin_teacher_count
    });
};