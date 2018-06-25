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
exports.getDistricts = function(req, res, next) {
    districtslib.getDistricts({}, function(err, districts) {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        req.store.districts = districts;
        next();
    });
};
exports.getDistrictsFromCounty = function(req, res, next) {
    var countyId;
    if (typeof req.params.id !== 'undefined') {
        countyId = utils.toObjectId(req.params.id);
    } else {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = {
        countyId: countyId
    };
    districtslib.getDistricts(query, function(err, districts) {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        next();
    });
};
exports.getDistrictsFromCountyRes = function(req, res, next) {
    res.response = req.store.get('districts');
    next();
};
exports.getCounties = function(req, res, next) {
    districtslib.getCounties({}, function(err, counties) {
        if (err) {
            return next(err);
        }
        req.store.set('counties', counties);
        req.store.counties = counties;
        next();
    });
};
//Code added by vivek starts
exports.getallCounties = function(req, res, next) {
    districtslib.getCounties({}, function(err, counties) {
        if (err) {
            return next(err);
        }
        req.store.set('counties', counties);
        res.response = counties;
        next();
    });
};
exports.getTeachersFromCountyIdRes = function(req, res, next) {
    res.response = req.store.get('teachers');
    next();
};
//Code added by vivek ends
exports.getDistrictFromId = function(req, res, next) {
    var distId = req.params.id;
    districtslib.getDistricts({
        _id: utils.toObjectId(distId)
    }, function(err, district) {
        if (err) {
            return next(err);
        }
        req.store.district = district;
        next();
    });
};
exports.getCountyFromId = function(req, res, next) {
    var countyId = req.params.cid;
    districtslib.getCounties({
        _id: utils.toObjectId(countyId)
    }, function(err, county) {
        if (err) {
            return next(err);
        }
        req.store.county = county;
        next();
    });
};
exports.getSchoolsAndDistricts = function(req, res, next) {
    var students = req.store.studentsInfo;
    async.map(students, findSchoolsAndDist, function(err, students) {
        if (err) {
            debug(err);
        }
        req.store.allData = students;
        next();
    });

    function findSchoolsAndDist(student, done) {
        if (!student) {
            debug('no student found');
            return done(null);
        }
        schoolslib.getSchools({
            _id: student.schoolId
        }, function(err, school) {
            if (err) {
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
            districtslib.getDistricts({
                _id: _.first(school).distId
            }, function(err, district) {
                if (err) {
                    return next(err);
                }
                student.districtName = _.first(district).name;
                districtslib.getCounties({
                    _id: _.first(district).countyId
                }, function(err, county) {
                    if (err) {
                        return next(err);
                    }
                    student.countyName = _.first(county).name;
                    done(null, student);
                });
            });
        });
    }
};
exports.getTeachersFromCountyId = function(req, res, next) {
    var countyId;
    var query1;
    if (typeof req.params.id !== 'undefined') {
        countyId = utils.toObjectId(req.params.id);
    } else {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = {countyId: countyId};
    districtslib.getDistricts(query, function(err, districts) {
        if (err) {
            return next(err);
        }
        var distIdArr 	= []; 
        // for (var i = 0; i < districts.length; i++){
        // 	distIdArr.dist_id = utils.toObjectId(districts[i]._id);
        // 	distIdArr.dist_name = districts[i].name;
        //     query = {distId: utils.toObjectId(districts[i]._id),active: true,enabled: true};
        //     schoolslib.getSchoolsData(query, {_id: true,name: true}, function(err, schools) {
        //         if (err) {
        //             return next(err);
        //         }
        //         for (var j = 0; j < schools.length; j++) {
        //             distIdArr.schools_id = utils.toObjectId(schools[j]._id);
        // 			distIdArr.schools_name = schools[j].name;
        //             query1 = {schoolId: utils.toObjectId(schools[j]._id),isLoggedIn: 1,enabled: true,active: true};
        //             teacherslib.getTeachers(query1, function(err, teachers) {
        //                 if (err) {
        //                     return next(err);
        //                 }
        //                 for (var k = 0; k < teachers.length; k++) {
        //                 	distIdArr.teacher_id = utils.toObjectId(teachers[k]._id);
        // 					distIdArr.teachers_firstname = teachers[k].firstName;
        //                 }                        
        //             });
        //         }
        //     });
        // }
        console.log(distIdArr);
        next();
    });
};
// exports.getTeachersFromCountyId = function(req, res, next) {
//     var countyId;
//     var query1;
//     if (typeof req.params.id !== 'undefined') {
//         countyId = utils.toObjectId(req.params.id);
//     } else {
//         countyId = utils.toObjectId(req.params.cid);
//     }
//     var query = {
//         countyId: countyId
//     };
//     districtslib.getDistricts(query, function(err, districts) {
//         if (err) {
//             return next(err);
//         }
//         var teacher = null;
//         var distIdArr = [];
//         var schoolsIds = [];
//         async.series({
//             districts: function(callback) {
//                 for (var i = 0; i < districts.length; i++) {
//                     distIdArr.push(utils.toObjectId(districts[i]._id));
//                     distIdArr.push(districts[i].name);
//                 }
//                 //callback(null, distIdArr);
//                 callback(null, districts);
//             },
//             schools: function(callback) {
//                 query = {
//                     distId: {
//                         $in: distIdArr
//                     },
//                     active: true,
//                     enabled: true
//                 };
//                 schoolslib.getSchoolsData(query, {}, function(err, schools) {
//                     if (err) {
//                         return next(err);
//                     }
//                     for (var i = 0; i < schools.length; i++) {
//                         schoolsIds.push(utils.toObjectId(schools[i]._id));
//                         schoolsIds.push(schools[i].name);
//                     }
//                     //callback(null, schoolsIds)
//                     callback(null, schools)
//                 });
//             },
//             teachers: function(cb) {
//                 query1 = {
//                     schoolId: {
//                         $in: schoolsIds
//                     },
//                     isLoggedIn: 1,
//                     enabled: true,
//                     active: true
//                 };
//                 teacherslib.getTeachers(query1, function(err, teachers) {
//                     if (err) {
//                         return next(err);
//                     }
//                     teacher = teachers;
//                     cb(null, teacher);
//                 });
//             }
//         }, 
//         function(err, results) {
//             res.status(200).json({
//                 results: results
//             });
//     });   
// });
// }

// var test = json.results;
// 	for(var x =0 ;x <test.districts.length;x++){
// 	    for(var y =0 ;y <test.schools.length;y++){
// 	        if(test.districts[x]._id == test.schools[y].distId){
// 	            test.districts[x].schools = [];
// 	            var t = test.schools[y];
// 	            t.teachers = [];
// 	            test.districts[x].schools.push(t); 
// 	            for(var z =0 ;z <test.teachers.length;z++){
// 	                if(test.schools[y]._id == test.teachers[z].schoolId){
// 	                console.log(test.schools[y]._id +" == "+ test.teachers[z].schoolId);
// 	                console.log(test.districts[x].schools);
// 	                 test.districts[x].schools.teachers.push(test.teachers[z]);
// 	                     //console.log(test.districts[x]);
// 	                }
// 	            }
// 	        }
	            
// 	    }
// 	}