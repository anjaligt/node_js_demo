'use strict';
var districtslib = require('../../lib/db/districts');
var utils = require('../../lib/utils');
var schoolslib = require('../../lib/db/schools');
var teacherslib = require('../../lib/db/teachers');
// var BadRequest = require('../../errors/errors').BadRequest;
// var errMsg = require('../../errors/errorCodes');
var async = require('async');
var _ = require('underscore');
var debug = require('debug')('ff:district');
exports.getDistricts = function(req, res, next)
{
    districtslib.getDistricts(
    {}, function(err, districts)
    {
        if (err)
        {
            return next(err);
        }
        req.store.set('districts', districts);
        req.store.districts = districts;
        next();
    });
};
exports.getDistrictsFromCounty = function(req, res, next)
{
    var countyId;
    if (typeof req.params.id !== 'undefined')
    {
        countyId = utils.toObjectId(req.params.id);
    }
    else
    {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = {
        countyId: countyId
    };
    districtslib.getDistricts(query, function(err, districts)
    {
        if (err)
        {
            return next(err);
        }
        req.store.set('districts', districts);
        next();
    });
};
exports.getDistrictsFromCountyRes = function(req, res, next)
{
    res.response = req.store.get('districts');
    next();
};
exports.getCounties = function(req, res, next)
{
    districtslib.getCounties(
    {}, function(err, counties)
    {
        if (err)
        {
            return next(err);
        }
        req.store.set('counties', counties);
        req.store.counties = counties;
        next();
    });
};
//Code added by vivek starts
exports.getallCounties = function(req, res, next)
{
    districtslib.getCounties(
    {}, function(err, counties)
    {
        if (err)
        {
            return next(err);
        }
        req.store.set('counties', counties);
        res.response = counties;
        next();
    });
};
exports.getTeachersFromCountyIdRes = function(req, res, next)
{
    res.response = req.store.get('teachers');
    next();
};
//Code added by vivek ends
exports.getDistrictFromId = function(req, res, next)
{
    var distId = req.params.id;
    districtslib.getDistricts(
    {
        _id: utils.toObjectId(distId)
    }, function(err, district)
    {
        if (err)
        {
            return next(err);
        }
        req.store.district = district;
        next();
    });
};
exports.getCountyFromId = function(req, res, next)
{
    var countyId = req.params.cid;
    districtslib.getCounties(
    {
        _id: utils.toObjectId(countyId)
    }, function(err, county)
    {
        if (err)
        {
            return next(err);
        }
        req.store.county = county;
        next();
    });
};
exports.getSchoolsAndDistricts = function(req, res, next)
{
    var students = req.store.studentsInfo;
    async.map(students, findSchoolsAndDist, function(err, students)
    {
        if (err)
        {
            debug(err);
        }
        req.store.allData = students;
        next();
    });

    function findSchoolsAndDist(student, done)
    {
        if (!student)
        {
            debug('no student found');
            return done(null);
        }
        schoolslib.getSchools(
        {
            _id: student.schoolId
        }, function(err, school)
        {
            if (err)
            {
                return done(err);
            }
            student.schoolName = _.first(school).name;
            delete student.schoolId;
            delete student.active;
            delete student.enabled;
            delete student.createdIso;
            delete student.updated;
            delete student.updatedIso;
            delete student.color;
            delete student.finalScore;
            districtslib.getDistricts(
            {
                _id: _.first(school).distId
            }, function(err, district)
            {
                if (err)
                {
                    return next(err);
                }
                student.districtName = _.first(district).name;
                districtslib.getCounties(
                {
                    _id: _.first(district).countyId
                }, function(err, county)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    student.countyName = _.first(county).name;
                    done(null, student);
                });
            });
        });
    }
};

exports.getTeachersFromCountyIdsorted = function(req, res, next)
{
    var countyId  =  utils.toObjectId(req.params.id);
    var query1;
    var teacherId = utils.toObjectId(req.params.tid);
    var query = {  countyId: countyId };

    districtslib.getDistricts(query, function(err, districts)
    {
        if (err)
        {
            return next(err);
        }
        var teacher = null;
        var distIdArr = [];
        var schoolsIds = [];
        var results1 = [];
        var results2 = [];
        async.series(
        {
            districts: function(callback)
            {
                for (var i = 0; i < districts.length; i++)
                {
                    distIdArr.push(utils.toObjectId(districts[i]._id));
                    distIdArr.push(districts[i].name);
                }
                callback(null, districts);
            },
            schools: function(callback)
            {
                query = {
                    distId:
                    {
                        $in: distIdArr
                    },
                    active: true,
                    enabled: true
                };
                schoolslib.getSchoolsData(query,
                {}, function(err, schools)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    for (var i = 0; i < schools.length; i++)
                    {
                        schoolsIds.push(utils.toObjectId(schools[i]._id));
                        schoolsIds.push(schools[i].name);
                    }
                    //callback(null, schoolsIds)
                    callback(null, schools)
                });
            },
            teachers: function(cb)
            {
                query1 = {
                    schoolId:
                    {
                        $in: schoolsIds
                    },
                    admin_teacher: '1',
                    enabled: true,
                    active: true
                };
                teacherslib.getTeachers(query1, function(err, teachers)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    teacher = teachers;
                    cb(null, teacher);
                });
            },
            admin_teachers: function(cb)
            {
                query1 = {_id:utils.toObjectId(teacherId),admin_teacher: '1', enabled: true, active: true };
                    
                teacherslib.getTeachers(query1, function(err, admin_teachers)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    admin_teachers = admin_teachers;
                    cb(null, admin_teachers);
                });
            }
        }, function(err, results)
        {

            console.log(results);
            // for (var i = 0; i < results.districts.length; i++)
            // {
            //     var district = {};
            //     if (results.districts[i]._id && results.districts[i].name)
            //     {
            //         district.districts_id   = results.districts[i]._id;
            //         district.districts_name = results.districts[i].name;
            //         district.schools_new    = [];

            //         for (var j = 0; j < results.schools.length; j++)
            //         {
            //             if (district.districts_id.toString() === results.schools[j].distId.toString())
            //             {
            //                 var teachers_new = [];

            //                 for (var k = 0; k < results.teachers.length; k++)
            //                 {
            //                     if (results.schools[j]._id.toString() === results.teachers[k].schoolId.toString())
            //                     {
            //                         if (results.teachers[k])
            //                         {
            //                             teachers_new.push(results.teachers[k]);
            //                         }

            //                     }
            //                 }
            //                 if (teachers_new.length > 0)
            //                 {
            //                     results.schools[j].teachers_new = teachers_new;
            //                 }
            //                 if (results.schools[j] && results.schools[j].noOfTeachers>0)
            //                 {
            //                     district.schools_new.push(results.schools[j]);
            //                 }
            //             }
            //         }
            //         results1.push(district);
            //     }

            // }for (var i = 0; i < results1.length; i++) {
            //     for (var j = 0; j < results1[i].schools_new.length; j++) {
            //         if(results1[i].schools_new[j].teachers_new && results1[i].schools_new[j].teachers_new!='undefined'){
            //             results2.push(results1[i]);
            //         }
            //     } 
            // }
            res.status(200).json(
            {
                results: results
            });
        });
    });
};

// exports.getTeachersFromCountyIdsorted = function(req, res, next)
// {
//     var countyId;
//     var query1;
//     if (typeof req.params.id !== 'undefined')
//     {
//         countyId = utils.toObjectId(req.params.id);
//     }
//     else
//     {
//         countyId = utils.toObjectId(req.params.cid);
//     }
//     var query = {
//         countyId: countyId
//     };
//     districtslib.getDistricts(query, function(err, districts)
//     {
//         if (err)
//         {
//             return next(err);
//         }
//         var teacher = null;
//         var distIdArr = [];
//         var schoolsIds = [];
//         var results1 = [];
//         var results2 = [];
//         async.series(
//         {
//             districts: function(callback)
//             {
//                 for (var i = 0; i < districts.length; i++)
//                 {
//                     distIdArr.push(utils.toObjectId(districts[i]._id));
//                     distIdArr.push(districts[i].name);
//                 }
//                 //callback(null, distIdArr);
//                 callback(null, districts);
//             },
//             schools: function(callback)
//             {
//                 query = {
//                     distId:
//                     {
//                         $in: distIdArr
//                     },
//                     active: true,
//                     enabled: true
//                 };
//                 schoolslib.getSchoolsData(query,
//                 {}, function(err, schools)
//                 {
//                     if (err)
//                     {
//                         return next(err);
//                     }
//                     for (var i = 0; i < schools.length; i++)
//                     {
//                         schoolsIds.push(utils.toObjectId(schools[i]._id));
//                         schoolsIds.push(schools[i].name);
//                     }
//                     //callback(null, schoolsIds)
//                     callback(null, schools)
//                 });
//             },
//             teachers: function(cb)
//             {
//                 query1 = {
//                     schoolId:
//                     {
//                         $in: schoolsIds
//                     },
//                     admin_teacher: '1',
//                     enabled: true,
//                     active: true
//                 };
//                 teacherslib.getTeachers(query1, function(err, teachers)
//                 {
//                     if (err)
//                     {
//                         return next(err);
//                     }
//                     teacher = teachers;
//                     cb(null, teacher);
//                 });
//             }
//         }, function(err, results)
//         {
//             for (var i = 0; i < results.districts.length; i++)
//             {
//                 var district = {};
//                 if (results.districts[i]._id && results.districts[i].name)
//                 {
//                     district.districts_id   = results.districts[i]._id;
//                     district.districts_name = results.districts[i].name;
//                     district.schools_new    = [];

//                     for (var j = 0; j < results.schools.length; j++)
//                     {
//                         if (district.districts_id.toString() === results.schools[j].distId.toString())
//                         {
//                             var teachers_new = [];

//                             for (var k = 0; k < results.teachers.length; k++)
//                             {
//                                 if (results.schools[j]._id.toString() === results.teachers[k].schoolId.toString())
//                                 {
//                                     if (results.teachers[k])
//                                     {
//                                         teachers_new.push(results.teachers[k]);
//                                     }

//                                 }
//                             }
//                             if (teachers_new.length > 0)
//                             {
//                                 results.schools[j].teachers_new = teachers_new;
//                             }
//                             if (results.schools[j] && results.schools[j].noOfTeachers>0)
//                             {
//                                 district.schools_new.push(results.schools[j]);
//                             }
//                         }
//                     }
//                     results1.push(district);
//                 }

//             }
//             for (var i = 0; i < results1.length; i++) {
//             	for (var j = 0; j < results1[i].schools_new.length; j++) {
//             		if(results1[i].schools_new[j].teachers_new && results1[i].schools_new[j].teachers_new!='undefined'){
//             			results2.push(results1[i]);
//             		}
//             	}
            	
//             }
//             res.status(200).json(
//             {
//                 results: results2
//             });
//         });
//     });
// };


// exports.getTeachersFromCountyIdsorted = function(req, res, next)
// {
//     var countyId;
//     var query1;
//     countyId = utils.toObjectId(req.params.id);
//     var teacher_Id = utils.toObjectId(req.params.tid);
//     var query = {
//         _id: teacher_Id
//     };
//     teacherslib.getTeachers(query, function(err, teachers)
//     {
//         if (err){ return next(err); }
//         var teacher             = null;
//         var associated_teachers = teachers[0].associated_teachers_id;
//         var teachersArr         = [];
//         var schoolsIds          = [];
//         var results1            = [];
//         var results2            = [];
        
//         if(teachers[0].associated_teachers_id)
//         {
//             var associate_teachers = {};

//             for (var i = 0; i < associated_teachers.length; i++) 
//             {
                
//                 var query = {_id: utils.toObjectId(associated_teachers[i])};

//                 teacherslib.getTeachers(query, function(err, associate_single_teachers)
//                 {
//                     if (err)
//                     { 
//                         return next(err);
//                     }

//                     associate_teachers.teachers_id      = associate_single_teachers[0]._id;
//                     associate_teachers.firstName        = associate_single_teachers[0].firstName;
//                     associate_teachers.lastName         = associate_single_teachers[0].lastName;
//                     associate_teachers.email            = associate_single_teachers[0].email;
//                     associate_teachers.active           = associate_single_teachers[0].active;
//                     associate_teachers.enabled          = associate_single_teachers[0].enabled;
//                     associate_teachers.schoolId         = associate_single_teachers[0].schoolId;
//                     associate_teachers.admin_teacher    = associate_single_teachers[0].admin_teacher;
//                     associate_teachers.isLoggedIn       = associate_single_teachers[0].isLoggedIn;
//                     query1 = {_id: utils.toObjectId(associate_teachers.schoolId), active: true, enabled: true};
//                     schoolslib.getSchoolsData(query1,{}, function(err, schools)
//                     {
//                         if (err)
//                         { 
//                             return next(err);
//                         }
//                         console.log(schools);
//                     });
//                 });
//             }
//         }
//     });
// };

exports.getTeachersFromCountyId = function(req, res, next)
{
    var countyId;
    var query1;
    if (typeof req.params.id !== 'undefined')
    {
        countyId = utils.toObjectId(req.params.id);
    }
    else
    {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = {
        countyId: countyId
    };
    districtslib.getDistricts(query, function(err, districts)
    {
        if (err)
        {
            return next(err);
        }
        var teacher = null;
        var distIdArr = [];
        var schoolsIds = [];
        var results1 = [];
        var results2 = [];
        async.series(
        {
            districts: function(callback)
            {
                for (var i = 0; i < districts.length; i++)
                {
                    distIdArr.push(utils.toObjectId(districts[i]._id));
                    distIdArr.push(districts[i].name);
                }
                callback(null, districts);
            },
            schools: function(callback)
            {
                query = {
                    distId:
                    {
                        $in: distIdArr
                    },
                    active: true,
                    enabled: true
                };
                schoolslib.getSchoolsData(query,
                {}, function(err, schools)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    for (var i = 0; i < schools.length; i++)
                    {
                        schoolsIds.push(utils.toObjectId(schools[i]._id));
                        schoolsIds.push(schools[i].name);
                    }
                    callback(null, schools)
                });
            },
            teachers: function(cb)
            {
                query1 = {
                    schoolId:
                    {
                        $in: schoolsIds
                    },
                    admin_teacher:'1',                    
                    enabled: true,
                    active: true
                };
                teacherslib.getTeachers(query1, function(err, teachers)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    teacher = teachers;
                    cb(null, teacher);
                });
            },
            loggedin_teacher: function(callback)
            {
                var query2 = {_id: utils.toObjectId(req.params.tid)};
                teacherslib.getTeachers(query2, function(err, teacher_data)
                {
                    if (err)
                    {
                        return next(err);
                    }
                    teacher_data = teacher_data;
                    callback(null, teacher_data);
                });
            },
        }, function(err, results)
        {
            for (var i = 0; i < results.districts.length; i++)
            {
                var district = {};
                if (results.districts[i]._id && results.districts[i].name)
                {
                    district.districts_id 	= results.districts[i]._id;
                    district.districts_name = results.districts[i].name;
                    for (var j = 0; j < results.schools.length; j++)
                    {
                        if (district.districts_id.toString() === results.schools[j].distId.toString())
                        {
                            district.school_id 		= results.schools[j]._id;
                            district.school_name 	= results.schools[j].name;
                        }
                        for (var k = 0; k < results.teachers.length; k++)
                        {
                            if (district.school_id && district.school_id.toString() === results.teachers[k].schoolId.toString())
                            {
                                district.firstName 	= results.teachers[k].firstName;
                                district.lastName 	= results.teachers[k].lastName;
                                district.email 		= results.teachers[k].email;
                                district.teacher_id = results.teachers[k]._id;
                            }
                        }
                    }
                    results1.push(district);
                }
            }
            for (var i = 0; i < results1.length; i++) 
            {
        		if(results1[i].teacher_id)
        		{
                    if(results.loggedin_teacher[0].associated_teachers_id)
                    {
                        var associated_teachers = results.loggedin_teacher[0].associated_teachers_id;
                        for (var j = 0; j < associated_teachers.length; j++) 
                        {
                            console.log(results1[i].teacher_id.toString() +'==='+ associated_teachers[j].toString());
                            if(results1[i].teacher_id.toString() === associated_teachers[j].toString()){
                                results1[i].checked = 2;
                            }else{
                                results1[i].checked = 1;
                            }
                        }
                        //return false;
                    }else{
                        results1[i].checked = 1;
                    }
        			results2.push(results1[i]);
        		}
            }
            res.status(200).json(
            {
                results: results2
            });
        });

    });
};


exports.GetcountybyTeachersId = function(req, res, next){
    var teacher_id    =   utils.toObjectId(req.params.id);
    schoolslib.getSchoolsData({_id: utils.toObjectId(req.params.sid), active: true, enabled: true},{}, function(err, schools){
        if (err)
        {
            return next(err);
        }
        req.store.schools = schools;
        var query = { _id: schools[0].distId};
        districtslib.getDistricts(query, function(err, districts)
        {
            if (err)
            {
                return next(err);
            }
            req.store.set('districts', districts);
            res.response = req.store.get('districts');
            next();
        });
    
    });
};