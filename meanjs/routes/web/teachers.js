'use strict';
// var Teachers = require('../web/teachers');
var _       = require('underscore');
var utils   = require('../../lib/utils');

exports.render = function(req, res) {
    var teachers    = req.store.teachers;
    var searchQuery = req.store.searchQuery;
    var districts   = req.store.districts;
    var counties    = req.store.counties;
    var schooles    = req.store.schools;
    var normal_teacher_count    = req.store.normal_teacher_count;
    var admin_teacher_count     = req.store.admin_teacher_count;
    res.json({'success':true, data:{
        teachers: true,
        searchQuery: searchQuery,
        data: teachers,
        districts: districts,
        counties: counties,
        schooles: schooles,
        normal_teacher_count: normal_teacher_count,
        admin_teacher_count: admin_teacher_count
    },message:'Teachers list.'});
    // res.render('teachers', {
    //     teachers: true,
    //     searchQuery: searchQuery,
    //     data: teachers,
    //     districts: districts,
    //     counties: counties,
    //     normal_teacher_count: normal_teacher_count,
    //     admin_teacher_count: admin_teacher_count
    // });
};

exports.extractParams = function(req, res, next) {
    var teacherParameters;
    if (Object.keys(req.query).length === 0) {
        teacherParameters = req.body;
    } else {
        teacherParameters = req.query;
    }
    req.store.set('teacherParameters', teacherParameters);
    next();
};

exports.extractQuery = function(req, res, next) {
    var teacherParameters = req.store.get('teacherParameters');
    var query = teacherParameters.q;
    req.store.set('query', query);
    next();
};

/**
 * Extract teacher id
 */
exports.extractTeacherId = function(req, res, next) {
    var teacherId = req.params.id;
    if (_.isUndefined(teacherId)) {
        req.flash('error', 'Teacher Id is required');
        return res.redirect('/teachers');
    } else {
        req.store.set('teacherId', teacherId);
        req.store.set('id', utils.toObjectId(teacherId));
        next();
    }
};