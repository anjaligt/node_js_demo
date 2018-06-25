'use strict';
var teacherslib = require('../../lib/db/teachers');
var schoolslib = require('../../lib/db/schools');
var async = require('async');
var _ = require('underscore');
var literacylib = require('../../lib/db/literacy');
var schoolslib = require('../../lib/db/schools');
var studentslib = require('../../lib/db/students');
var numeracylib = require('../../lib/db/numeracy');
var sociallib = require('../../lib/db/social');
var districtslib = require('../../lib/db/districts');
var fs = require('fs');
var debug = require('debug')('ff:report');
var stringify = require('csv-stringify');
var path = require('path');
var common = require('../../lib/common');
// var questions = require('../../config/questions');
var config = require('../../config/config');
var utils = require('../../lib/utils');

exports.getDatas = function(req, res, next) {
    var students = req.store.get('students');

    async.map(students, getInfo, function(err, students) {
        if (err) {
            debug(err);
        }

        req.store.studentsInfo = students;
        next();
    });

    function getInfo(student, done) {

        teacherslib.getTeachers({
            _id: student.teacherId,
            enabled: true,
            active:true
        }, function(err, teachers) {
            if (err) {
                return done(err);
            }

            if (teachers.length) {
                var teacher = _.first(teachers);
                delete student.teacherId;

                student.teacherName = teacher.firstName + ' ' + teacher.lastName;
                student.teacherEmail = teacher.email;

                if (req.store.district) {
                    student.districtName = _.first(req.store.district).name;
                }

                if (req.store.county) {
                    student.countyName = _.first(req.store.county).name;
                }

                student.literacyScoresArr = [];
                student.numeracyAnswers = [];
                student.socialAnswers = [];

                literacylib.getStudents({
                    studentId: student._id,
                    enabled: true,
                    active:true
                }, function(err, literacy) {
                    if (err) {
                        return done(err);
                    }

                    if (literacy.length) {
                        student.literacyScore = _.first(literacy).totalScore;

                        var literacyAns = _.pluck(_.first(literacy).answers, 'answers');
                        var letters = _.first(literacy).nameEachLetter;
                        var letterSound = _.first(literacy).letterSound;
                        var possitionchangeLiteracy = _.first(config.replacePossArr.literacy);

                        literacyAns.splice(possitionchangeLiteracy.index, possitionchangeLiteracy.count);
                        literacyAns = common.getYesNoAnswers(literacyAns, 'literacy');

                        var eachLettersAnsArr = common.lettersAnswers(letters, 'letters');
                        var letterSoundAnsArr = common.lettersAnswers(letterSound, 'lettersound');

                        literacyAns.splice(possitionchangeLiteracy.index, 0, eachLettersAnsArr, letterSoundAnsArr);
                        student.literacyAnswers = _.flatten(literacyAns);
                    }

                    numeracylib.getStudents({
                        studentId: student._id,
                        enabled: true,
                        active:true
                    }, function(err, numeracy) {
                        if (err) {
                            return done(err);
                        }

                        if (numeracy.length) {
                            student.numeracyScore = _.first(numeracy).totalScore;

                            var numeracyAns = _.pluck(_.first(numeracy).answers, 'answers');
                            var numbers = _.first(numeracy).nameEachNumber;

                            var possitionchangeNumeracy = _.first(config.replacePossArr.numeracy);
                            numeracyAns.splice(possitionchangeNumeracy.index, possitionchangeNumeracy.count);
                            numeracyAns = common.getYesNoAnswers(numeracyAns, 'numeracy');

                            var nameEachNumberAns = common.numberAnswers(numbers);

                            numeracyAns.splice(possitionchangeNumeracy.index, 0, nameEachNumberAns);
                            student.numeracyAnswers = _.flatten(numeracyAns);
                        }

                        sociallib.getStudents({
                            studentId: student._id,
                            enabled: true,
                            active:true
                        }, function(err, social) {
                            if (err) {
                                return done(err);
                            }

                            if (social.length) {
                                student.socialScore = _.first(social).totalScore;
                                var socialAns = _.pluck(_.first(social).answers, 'answers');
                                socialAns = common.getYesNoAnswers(socialAns, 'social');
                                student.socialAnswers = _.flatten(socialAns);
                            }

                            delete student._id;
                            done(null, student);
                        });
                    });
                });
            } else {
                debug('no teacherId');
                return done(null);
            }
        });
    }
};

exports.createReport = function(req, res, next) {

    var csvPath = __dirname + '/../../dist/data/report.csv';

    var studentsInfo = _.compact(req.store.studentsInfo);
    var csvHead = common.getCSVHeader();

    var dataFormate = studentsInfo.map(function(data) {
        var csvArr = [];
        csvArr.push(data.firstName, data.lastName, new Date(data.created).toGMTString(), data.gender, data.dob, data.firstLanguage, data.iep, data.preSchool, data.transitionalKindergarten, data.teacherName, data.teacherEmail, data.schoolName, data.districtName, data.countyName);
        csvArr = csvArr.concat(data.literacyAnswers, data.numeracyAnswers, data.socialAnswers);
        return csvArr;
    });

    var index = 0;
    dataFormate.splice(index, 0, csvHead);

    createCsvReport(dataFormate, csvPath, function(err) {
        if (err) {
            debug(err);
        }
        req.store.detailed = true;
        next();
    });
};

exports.createSimpleReport = function(req, res, next) {
    var csvPath = __dirname + '/../../dist/data/report.csv';
    var studentsInfo = _.compact(req.store.studentsInfo);
    var csvHead = [];
    csvHead.push('First name', 'Last name', 'Created', 'Gender', 'DOB', 'First Language', 'IEP', 'Preschool', 'Transitional Kindergarten', 'Literacy score', 'Numeracy score', 'Social score', 'Teacher Name', 'Teacher Email', 'School Name', 'District Name', 'County Name');

    var dataFormate = studentsInfo.map(function(data) {
        var csvArr = [];
        if (!data.literacyScore) {
            data.literacyScore = 'no data';
        }
        if (!data.numeracyScore) {
            data.numeracyScore = 'no data';
        }
        if (!data.socialScore) {
            data.socialScore = 'no data';
        }
        csvArr.push(data.firstName, data.lastName, new Date(data.created).toGMTString(), data.gender, data.dob, data.firstLanguage, data.iep, data.preSchool, data.transitionalKindergarten, data.literacyScore, data.numeracyScore, data.socialScore, data.teacherName, data.teacherEmail, data.schoolName, data.districtName, data.countyName);
        return csvArr;
    });

    var index = 0;
    dataFormate.splice(index, 0, csvHead);

    createCsvReport(dataFormate, csvPath, function(err) {
        if (err) {
            debug(err);
        }
        req.store.detailed = false;
        next();
    });
};

function createCsvReport(dataFormate, csvPath, done) {
    stringify(dataFormate, function(err, output) {
        if (err) {
            done(err);
        }
        fs.writeFile(csvPath, output, function(err) {
            if (err) {
                done(err);
            }
            done(null);
        });
    });
}

exports.download = function(req, res) {

    var reportName;

    if (req.params.sid) {
        reportName = _.first(req.store.schools).name;
    } else if (req.params.id) {
        reportName = _.first(req.store.district).name;
    } else {
        reportName = _.first(req.store.county).name;
    }

    if (req.params.sid && req.params.tid) {
        reportName = req.store.teacher.firstName.toLowerCase() + '-' + req.store.teacher.lastName.toLowerCase();
    }

    reportName = reportName.replace(/\s+/g, '-');

    var filePath = path.resolve(__dirname + '/../../dist/data/report.csv');

    if (req.store.detailed) {
        reportName = reportName + '-raw.csv';
    } else {
        reportName = reportName + '.csv';
    }

    res.download(filePath, reportName, function(err) {
        debug(err);
    });
};

exports.allDownload = function(req, res) {
    var filePath = path.resolve(__dirname + '/../../dist/data/report.csv');
    var filename;
    if (req.store.detailed) {
        filename = 'all-counties-raw.csv';
    } else {
        filename = 'all-counties.csv';
    }
    res.download(filePath, filename, function(err) {
        debug(err);
    });
};


exports.extractParams = function(req, res, next) {
    var counties_count = req.store.counties_count;
    var districts_count = req.store.districts_count;
    var schools_count = req.store.schools_count;
    var students_count = req.store.students_count;
    var registered_teacher = req.store.registered_teacher;
    var loggedin_teacher = req.store.loggedin_teacher;
    res.json({
        'success': true,
        data: {
            counties_count: counties_count,
            districts_count: districts_count,
            schools_count: schools_count,
            students_count: students_count,
            registered_teacher: registered_teacher,
            loggedin_teacher: loggedin_teacher
        },
        message: 'Report Dashboard.'
    });
};

exports.extractTeacherParticipationParams = function(req, res, next) {
    var registered_teacher = req.store.registered_teacher;
    var loggedin_teacher = req.store.loggedin_teacher;
    res.json({
        'success': true,
        data: {
            registered_teacher: registered_teacher,
            loggedin_teacher: loggedin_teacher
        },
        message: 'Teacher participation.'
    });
};

exports.extractStudentsParams = function(req, res, next) {
    var students_count = req.store.students_count;
    var litearcy_count = req.store.litearcy_count;
    res.json({
        'success': true,
        data: {
            students_count: students_count,
            litearcy_count: litearcy_count
        },
        message: 'Teacher participation.'
    });
};



exports.getDashboardTotalReport = function(req, res, next) {
    districtslib.getCounties({
        enabled: true,
        active: true
    }, function(err, data) {
        if (err) {
            callback(err)
        } else {
            async.forEachOf(data, function(countyData, countyKey, asynCountyCallback) {
                districtslib.getDistricts({
                    enabled: true,
                    active: true,
                    countyId: countyData._id
                }, function(err, distResult) {
                    if (err) {
                        asynCountyCallback(err);
                    } else {
                        data[countyKey].district_new = distResult;

                        async.forEachOf(data[countyKey].district_new, function(distData, distKey, asynDistCallback) {
                            schoolslib.getSchoolsData({
                                enabled: true,
                                active: true,
                                distId: distData._id
                            }, {}, function(err, schoolResult) {
                                if (err) {
                                    asynCountyCallback(err);
                                } else {
                                    data[countyKey].district_new[distKey].schools_new = schoolResult;
                                    asynDistCallback();
                                }
                            });

                        }, function(err, result) {
                            if (err) {
                                asynCountyCallback(err);
                            } else {
                                asynCountyCallback();
                            }
                        });
                    }
                });
            }, function(err, result) {
                if (err) {
                    res.json({
                        success: false,
                        data: [],
                        message: err
                    });
                } else {
                    res.json({
                        success: true,
                        data: data,
                        message: 'Green, Yellow & Red Lights Results'
                    });
                }
            });

        }
    });
};

exports.extractParamsForTools = function(req, res, next) {
    var counties = req.store.counties;
    var districts = req.store.districts;
    var schools = req.store.schools;
    var students_count = req.store.students_count;
    var numeracy = req.store.numeracy;
    var numeracy_count = req.store.numeracy_count;
    var literacy = req.store.literacy;
    var literacy_count = req.store.literacy_count;
    var social = req.store.social;
    var social_count = req.store.social_count;
    var results1 = [];
    var results2 = [];

    var litPoor = 6,
        litGood = 11,
        litVeryGood = 15,
        numePoor = 6,
        numeGood = 12,
        numeVeryGood = 16,
        socPoor = 3,
        socGood = 6,
        socVeryGood = 9;

    for (var i = 0; i < counties.length; i++) {

        var counties_noOfTeachers = 0;

        results1[i] = {};

        if (counties[i]._id && counties[i].name) {

            results1[i].districts_new = [];

            for (var j = 0; j < districts.length; j++) {

                var districts_noOfTeachers = 0;

                if (districts[j] && districts[j].name && districts[j].countyId) {

                    if (counties[i]._id.toString() === districts[j].countyId.toString()) {

                        var schools_new = [];

                        for (var k = 0; k < schools.length; k++) {

                            if (districts[j]._id && schools[k].distId) {

                                if (districts[j]._id.toString() === schools[k].distId.toString()) {

                                    if (schools[k]) {


                                        districts_noOfTeachers += parseInt(schools[k].noOfTeachers);
                                        counties_noOfTeachers += parseInt(schools[k].noOfTeachers);


                                        // for litearcy percentage
                                        schools[k].literacy = [];

                                        var literacyPoorNumRecord = literacy.filter(function(obj) {
                                            return obj.score <= litPoor && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var literacyPoorPercent = (literacyPoorNumRecord.length / students_count) * 100;
                                        literacyPoorPercent = literacyPoorPercent.toFixed(2);

                                        var literacyGoodNumRecord = literacy.filter(function(obj) {
                                            return obj.score > litPoor && obj.score <= litGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var literacyGoodPercent = (literacyGoodNumRecord.length / students_count) * 100;
                                        literacyGoodPercent = literacyGoodPercent.toFixed(2);

                                        var literacyVeryGoodNumRecord = literacy.filter(function(obj) {
                                            return obj.score > litGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var literacyVeryGoodPercent = (literacyVeryGoodNumRecord.length / students_count) * 100;
                                        literacyVeryGoodPercent = literacyVeryGoodPercent.toFixed(2);
                                        schools[k].literacy["red"] = literacyPoorPercent;
                                        schools[k].literacy["yellow"] = literacyGoodPercent;
                                        schools[k].literacy["green"] = literacyVeryGoodPercent;



                                        // for numeracy percentage

                                        schools[k].numeracy = [];

                                        var numeracyPoorNumRecord = numeracy.filter(function(obj) {
                                            return obj.score <= numePoor && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var numeracyPoorPercent = (numeracyPoorNumRecord.length / students_count) * 100;
                                        numeracyPoorPercent = numeracyPoorPercent.toFixed(2);


                                        var numeracyGoodNumRecord = numeracy.filter(function(obj) {
                                            return obj.score > numePoor && obj.score <= numeGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var numeracyGoodPercent = (numeracyGoodNumRecord.length / students_count) * 100;
                                        numeracyGoodPercent = numeracyGoodPercent.toFixed(2);


                                        var numeracyVeryGoodNumRecord = numeracy.filter(function(obj) {
                                            return obj.score > numeGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var numeracyVeryGoodPercent = (numeracyVeryGoodNumRecord.length / students_count) * 100;
                                        numeracyVeryGoodPercent = numeracyVeryGoodPercent.toFixed(2);


                                        schools[k].numeracy["red"] = numeracyPoorPercent;
                                        schools[k].numeracy["yellow"] = numeracyGoodPercent;
                                        schools[k].numeracy["green"] = numeracyVeryGoodPercent;


                                        // for social percentage

                                        schools[k].social = [];

                                        var socialPoorNumRecord = social.filter(function(obj) {
                                            return obj.score < socPoor && obj.schoolId.toString() === schools[k]._id.toString();
                                        });

                                        var socialPoorPercent = (socialPoorNumRecord.length / students_count) * 100;
                                        socialPoorPercent = socialPoorPercent.toFixed(2);


                                        var socialGoodNumRecord = social.filter(function(obj) {
                                            return obj.score > socPoor && obj.score <= socGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var socialGoodPercent = (socialGoodNumRecord.length / students_count) * 100;
                                        socialGoodPercent = socialGoodPercent.toFixed(2);


                                        var socialVeryGoodNumRecord = social.filter(function(obj) {
                                            return obj.score > socGood && obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        var socialVeryGoodPercent = (socialVeryGoodNumRecord.length / students_count) * 100;

                                        socialVeryGoodPercent = socialVeryGoodPercent.toFixed(2);


                                        schools[k].social["red"] = numeracyPoorPercent;
                                        schools[k].social["yellow"] = numeracyGoodPercent;
                                        schools[k].social["green"] = numeracyVeryGoodPercent;
                                        schools_new.push(schools[k]);
                                    }
                                }
                            }
                        }
                        if (schools_new && schools_new.length > 0 && counties[i]._id) {
                            districts[j].schools_new = schools_new;
                            results1[i].county_id = counties[i]._id;
                            results1[i].county_name = counties[i].name;
                            districts[j]['noOfTeachersForDistrict'] = districts_noOfTeachers;
                            results1[i].counties_noOfTeachers = counties_noOfTeachers;
                            results1[i].districts_new.push(districts[j]);
                        }
                    }
                }
            }

        }
    }
    res.json({
        'success': true,
        data: results1,
        message: 'Green, Yellow & Red Lights Results.'
    });

}


exports.extractParamsForDownloadReport = function(req, res, next) {
    var teachers = req.store.teachers;
    var students = req.store.students;

    res.json({
        'success': true,
        data: {
            teachers: teachers,
            students: students
        },
        message: 'Reports - Download'
    });
};


exports.detailedReportOne = function(req, res, next) { 
  var numberOfTeachers = 0;
  var numberOfStudents = 0;
  var data =req.body;
  var countyData = {};
   async.waterfall([
          function county(callback){ 
            var countyCondition = {enabled:true,active:true,_id:utils.toObjectId(data.county_id)};
            // if(data.from_date && data.to_date){
            //     countyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
            // } 
            districtslib.getCountYByAttr(countyCondition,{},function(err,county){
               if(err){
                   callback(err);
                 }else{
                    if(county){
                        countyData = county;
                          var distCondition = {enabled:true,active:true};
                             var distIds = [];
                             var district_id = (data.district_id) ? data.district_id : [];
                             if(district_id.length){
                                data.district_id.forEach(function(id){
                                  distIds.push(utils.toObjectId(id));
                                });
                                distCondition._id = {$in:distIds};
                             } 
                         
                            // if(data.from_date && data.to_date){
                            //     distCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                            // }  

                         distCondition.countyId=utils.toObjectId(county._id);  
                            
                        
                         districtslib.getDistricts(distCondition,function(err,districts){
                               if(err){
                                   callback(err);
                                 }else{
                                  countyData.districts_new = districts;
                             
                                   async.forEachOf(districts, function (distData, distKey, asyncDistCallback) {
                                      
                                     var schoolCondition = {enabled:true,active:true};
                                     var schoolIds = [];
                                     var school_id = (data.school_id) ? data.school_id :[];
                                     if(school_id.length){
                                        data.school_id.forEach(function(id){
                                          schoolIds.push(utils.toObjectId(id));
                                        });
                                        schoolCondition._id = {$in:schoolIds};
                                     } 

                                    // if(data.from_date && data.to_date){
                                    //     schoolCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                    // } 

                                     schoolCondition.distId=utils.toObjectId(distData._id);  
                                    

                                      schoolslib.getSchools(schoolCondition,function(err,schooles){
                                        if(err){
                                            asyncDistCallback(err);
                                          }else{
                                            
                                             countyData.districts_new[distKey].schools_new = schooles;
                                              async.forEachOf(schooles, function (schoolData, schoolKey, asyncSchoolCallback) {
                                                var teacherCondition = {schoolId:utils.toObjectId(schoolData._id),enabled:true,active:true};
                                                if(data.from_date && data.to_date){
                                                    teacherCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                }  

                                                 teacherslib.getTeachers(teacherCondition,function(err,teachers){
                                                    if(err){
                                                         asyncSchoolCallback(err);
                                                      }else{
                                                       
                                                        numberOfTeachers += teachers.length

                                                        countyData.districts_new[distKey].schools_new[schoolKey].teachers_new = teachers;

                                                         async.forEachOf(teachers, function (teacherData, teacherKey, asyncTeacherCallback) {
                                                            var studentCondition = {enabled:true,active:true,teacherId:utils.toObjectId(teacherData._id)};
                                                            if(data.from_date && data.to_date){
                                                                studentCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                            } 
                                                          studentslib.StudentsCount(studentCondition,function(err,studentCount){
                                                              if(err){
                                                                   asyncDistCallback(err);
                                                              }else{
                                                                countyData.districts_new[distKey].schools_new[schoolKey].teachers_new[teacherKey].numberOfStudents = studentCount;
                                                                 numberOfStudents += studentCount;
                                                                   asyncTeacherCallback();
                                                              }
                                                          });

                                                        
                                                         },function(err){
                                                           if(err){
                                                              asyncSchoolCallback(err);
                                                           }else{
                                                              asyncSchoolCallback();
                                                           }
                                                         });


                                                       
                                                      }
                                                  });

                                                   
                                                  },function(err){
                                                    if(err){
                                                      asyncDistCallback(err);
                                                    }else{
                                                       asyncDistCallback();
                                                    }
                                                  });
                                          }
                                         });


                                       
                                   },function(err){
                                       if(err){
                                         asyncDistCallback(err);
                                       }else{
                                         callback(null, county);
                                       }
                                   });

                                 
                               }
                           });
                 }else{
                   countyData = county;
                   callback(null, county);
                 }
                    
               }
           });
            
          } 
           
        ], function (err, result) {
             if(err){
                res.json({
                      'success': true,
                      data: [],
                      message: err
                   });
             }else{
              var html='<!DOCTYPE html><html>';
                  html +='<head><meta charset="utf-8"><title>PDF Report</title></head><body>';
                  html +='<div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">';
           
                  html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Teachers by County / District / School</div>'  
                  html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';
                  html +='<div class="header-bottom"style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
                         '<font class="pull-left" style="float:left;">'+data.year+' KRS Assessments</font>'+
                         '<font class="pull-right" style="float:right">Generated on '+data.current_date+'</font>'+
                         '</div>';

                  html +='<div class="table-container margin-top-30" style="border:#d8d8d8 1px solid; margin: 30px 10px;">'+
                         '<h1 style="text-align: center; font-size: 20px;">Summary</h1>'+
                         '<table style="width:100%; border-collapse:collapse; ">'+
                         '<tr style="background: #f9f9f9;">'+
                         '<td style="width:80%; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Total Numbers of Teachers</td>'+
                         '<td style="width:71%; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+numberOfTeachers+'</td>'+
                         '</tr>'+
                         '<tr style="background: #ebebeb;">'+
                         '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Total Number of Students</td>'+
                         '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+numberOfStudents+'</td>'+  
                         '</tr>'+
                         '</table>'+
                         '</div>';

                    html +='<h1 class="detalied-report" style="width: 100%; text-align: center; font-size: 20px; margin-bottom: 6px; margin-top: 30px;">Detailed Report</h1>';            
                   
                    var countyName = (countyData.isOther) ? ('Other('+countyData.name+')') : countyData.name;
                    html +='<div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 10px;">';
                    html +='<h1 class="text-left padding-left" style="text-align: left !important; padding-left: 10px; font-size:20px;">'+countyName+'</h1>';
                   
                      async.forEachOf(countyData.districts_new, function (distData, distKey, asyncDistCallback) {
                          html +='<p class="padding-left" style="padding-left: 10px;">'+distData.name+'</p>';
                          
                           async.forEachOf(distData.schools_new, function (schoolData, schoolKey, asyncSchoolCallback) {
                              
                               html +='<table style="width:100%; border-collapse:collapse; ">'+
                                  '<tr style="background: #ebebeb;">'+
                                 '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:100px">School</td>'+
                                  '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:60px">First Name</td>'+
                                  '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:60px">Last Name</td>'+
                                  '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:80px">Email</td>'+
                                  '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:70px"># of Students</td>'+
                                  '</tr>';
                                  var teachers_new = schoolData.teachers_new;
                                   //Sort by student last name 
                                     teachers_new = teachers_new.sort(function(a, b) {
                                        var textA = a.lastName.toUpperCase();
                                        var textB = b.lastName.toUpperCase();
                                        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                                     });
                                  if(!teachers_new.length){
                                       html +='<tr style="background: #f9f9f9;">'+
                                               '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>'+
                                               '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                               '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                               '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                               '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                               '</tr>';
                                    }
                              async.forEachOf(teachers_new, function (teacherData, teacherKey, asyncTeacherCallback) {
                                  html +='<tr style="background: #f9f9f9;">';
                                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>';
                                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+teacherData.firstName+'</td>';
                                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+teacherData.lastName+'</td>';
                                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+teacherData.email+'</td>';
                                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+teacherData.numberOfStudents+'</td>';
                                  html +='</tr>';
                                asyncTeacherCallback();
                              },function(err){
                                 if(err){
                                    asyncSchoolCallback(err);
                                 }else{
                                    html +='<table>';
                                    asyncSchoolCallback();
                                 }
                              })
                              
                            
                           },function(err){
                            if(err){
                               asyncDistCallback(err);
                            }else{
                               asyncDistCallback();
                            }
                           })
                          

                        
                      },function(err){
                          if(err){
                            asyncDistCallback(err);
                          }else{

                            html +='</div></div><body></html>';
                            districtslib.exportPdf({html:html,file_name:data.file_name},function(err,pdfResult){
                                    if(err){
                                       res.json({
                                            'success': false,
                                             data: [],
                                             message: err
                                        });
                                    }else{
                                        res.json({
                                          success: true,
                                          data:pdfResult,
                                          //data: {countyData:countyData,numberOfTeachers:numberOfTeachers, numberOfStudents:numberOfStudents},
                                          message: 'Detailed Report Second.'
                                        });
                                    }
                                 });



                          }
                      });

              
              
               
             }
        });



};




exports.detailedReportTwo = function(req, res, next) {
  var numberOfTeachers = 0;
  var numberOfStudents = 0;
  var data =req.body;
  var countyData = {};
   async.waterfall([
         function teachers(callback){
            var teacherCondition = {enabled:true,active:true};
            if(data.from_date && data.to_date){
                teacherCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
            } 
             teacherslib.getTeachers(teacherCondition,function(err,allTeachers){
                  if(err){
                       callback(err);
                  }else{
                        callback(null,allTeachers);
                  }
              });
         },
          function county(allTeachers,callback){ 
            var countyCondition = {enabled:true,active:true,_id:utils.toObjectId(data.county_id)};
            // if(data.from_date && data.to_date){
            //     countyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
            // } 
            districtslib.getCountYByAttr(countyCondition,{},function(err,county){
               if(err){
                   callback(err);
                 }else{
                    if(county){
                        countyData = county;
                          var distCondition = {enabled:true,active:true};
                             var distIds = [];
                             var district_id = (data.district_id) ? data.district_id : [];
                             if(district_id.length){
                                data.district_id.forEach(function(id){
                                  distIds.push(utils.toObjectId(id));
                                });
                                distCondition._id = {$in:distIds};
                             }

                             // if(data.from_date && data.to_date){
                             //        distCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                             // } 
                         
                         distCondition.countyId=utils.toObjectId(county._id);  
                             
                       
                         districtslib.getDistricts(distCondition,function(err,districts){
                               if(err){
                                   callback(err);
                                 }else{ 
                                  countyData.districts_new = districts;
                             
                                   async.forEachOf(districts, function (distData, distKey, asyncDistCallback) {
                                      
                                     var schoolCondition = {enabled:true,active:true};
                                     var schoolIds = [];
                                     var school_id = (data.school_id) ? data.school_id :[];
                                     if(school_id.length){
                                        data.school_id.forEach(function(id){
                                          schoolIds.push(utils.toObjectId(id));
                                        });
                                        schoolCondition._id = {$in:schoolIds};
                                     }

                                      // if(data.from_date && data.to_date){
                                      //   schoolCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                      // } 
                                    
                                     schoolCondition.distId=utils.toObjectId(distData._id);  
                                    

                                      schoolslib.getSchools(schoolCondition,function(err,schooles){
                                        if(err){
                                            asyncDistCallback(err);
                                          }else{
                                            
                                             countyData.districts_new[distKey].schools_new = schooles;
                                              async.forEachOf(schooles, function (schoolData, schoolKey, asyncSchoolCallback) {
                                       
                                                 var schoolStudentCond = {schoolId:utils.toObjectId(schoolData._id),enabled:true,active:true};
                                                 if(data.from_date && data.to_date){
                                                    schoolStudentCond.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                  }  

                                                 studentslib.getStudents(schoolStudentCond,function(err,students){
                                                    if(err){
                                                         asyncSchoolCallback(err);
                                                      }else{
                                                       
                                                          countyData.districts_new[distKey].schools_new[schoolKey].students_new = students;

                                                     
                                                         async.forEachOf(students, function (studentData, studentKey, asyncStudentCallback) {
                                                           var teacherArr = allTeachers.filter(function(obj){
                                                                       return obj._id.toString() ==studentData.teacherId.toString();
                                                                   });
                                                                   if(teacherArr.length){
                                                                          countyData.districts_new[distKey].schools_new[schoolKey].students_new[studentKey].teachers_name =  teacherArr[0].firstName+' '+teacherArr[0].lastName;
                                                                   }else{
                                                                     countyData.districts_new[distKey].schools_new[schoolKey].students_new[studentKey].teachers_name =  '-';
                                                                   }

                                                                     var literacyStudentCond = {enabled:true,active:true,studentId:utils.toObjectId(studentData._id)};
                                                                     if(data.from_date && data.to_date){
                                                                        literacyStudentCond.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                                      } 
                                                                     literacylib.getStudents(literacyStudentCond,function(err,literacy){
                                                                      if(err){
                                                                           asyncDistCallback(err);
                                                                      }else{
                                                                          
                                                                           countyData.districts_new[distKey].schools_new[schoolKey].students_new[studentKey].literacy = (literacy.length) ? 1 : 0;
                                                                             var numeracyStudentCond = {enabled:true,active:true,studentId:utils.toObjectId(studentData._id)};
                                                                             if(data.from_date && data.to_date){
                                                                                numeracyStudentCond.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                                              } 
                                                                             numeracylib.getStudents(numeracyStudentCond,function(err,numeracy){
                                                                                  if(err){
                                                                                       asyncDistCallback(err);
                                                                                  }else{
                                                                                      
                                                                                       countyData.districts_new[distKey].schools_new[schoolKey].students_new[studentKey].numeracy = (numeracy.length) ? 1 : 0;
                                                                                       
                                                                                         var socialStudentCond = {enabled:true,active:true,studentId:utils.toObjectId(studentData._id)};
                                                                                         if(data.from_date && data.to_date){
                                                                                            socialStudentCond.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                                                                          } 
                                                                                         sociallib.getStudents(socialStudentCond,function(err,social){
                                                                                              if(err){
                                                                                                   asyncDistCallback(err);
                                                                                              }else{
                                                                                                  
                                                                                                   countyData.districts_new[distKey].schools_new[schoolKey].students_new[studentKey].social = (social.length) ? 1 : 0;
                                                                                                   asyncStudentCallback();
                                                                                              }
                                                                                          });

                                                                                       
                                                                                  }
                                                                              });
                                                                   

                                                                   
                                                              }
                                                          });

                                                        
                                                         },function(err){
                                                           if(err){
                                                              asyncSchoolCallback(err);
                                                           }else{
                                                              asyncSchoolCallback();
                                                           }
                                                         });


                                                       
                                                      }
                                                  });

                                                   
                                                  },function(err){
                                                    if(err){
                                                      asyncDistCallback(err);
                                                    }else{
                                                       asyncDistCallback();
                                                    }
                                                  });
                                          }
                                         });


                                       
                                   },function(err){
                                       if(err){
                                         asyncDistCallback(err);
                                       }else{
                                         callback(null, county);
                                       }
                                   });

                                 
                               }
                           });
                 }else{
                   countyData = county;
                   callback(null, county);
                 }
                    
               }
           });
            
          } 
           
        ], function (err, result) {
             if(err){
                res.json({
                      'success': true,
                      data: [],
                      message: err
                   });
             }else{
                

            var html = '<!DOCTYPE html><html>';
            html +='<head><meta charset="utf-8"><title>PDF Report</title></head>';
            html +='<body>';
            html +='<div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">';
            html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Students by County / District / School</div>';
            html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';
            html +='<div class="header-bottom"style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
                   '<font class="pull-left" style="float:left;">'+data.year+' KRS Assessments</font>'+
                   '<font class="pull-right" style="float:right">Generated on '+data.current_date+'</font>'+
                   '</div></br>';
           // async.forEachOf(results2, function (countyData, countyKey, asyncCountyCallback) {
              var countyName = (countyData.isOther) ? ('Other('+countyData.name+')') : countyData.name;
                html +='<div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 10px;">';
                html +='<h1 class="text-left padding-left" style="text-align: left !important; padding-left: 10px; font-size:20px;">'+countyName+'</h1>';
                
                var district_new = (countyData.districts_new) ? countyData.districts_new : []; 
                async.forEachOf(district_new, function (distData, distKey, asyncDistCallback) {
                   html +='<p class="padding-left" style="padding-left: 10px;">'+distData.name+'</p>'; 

                       var schools_new = (distData.schools_new) ? distData.schools_new : [];
                       async.forEachOf(schools_new, function (schoolData, schoolKey, asyncSchoolCallback) {
                        html +='<table style="width:100%; border-collapse:collapse; ">'+
                              '<tr style="background: #ebebeb;">'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:90px;">School</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:90px;">First Name</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:90px;">Last Name</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:70px;">Literacy</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:70px;">Numeracy</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:90px;">Soc-Phy-Emo</td>'+
                              '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; width:90px;">Teacher</td>'+
                              '</tr>';
                            var students_new = (schoolData.students_new) ? schoolData.students_new : [];
                            //Sort by student last name 
                             students_new = students_new.sort(function(a, b) {
                                var textA = a.lastName.toUpperCase();
                                var textB = b.lastName.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                             });

                            if(!students_new.length){
                               html +='<tr style="background: #f9f9f9;">'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">-</td>'+
                                       '</tr>';
                            }
                             
                             async.forEachOf(students_new, function (studentData, studentKey, asyncStudentCallback) {
                                
                                html +='<tr style="background: #f9f9f9;">'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+studentData.firstName+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+studentData.lastName+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+((studentData.literacy) ? 'Yes' : 'No')+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+((studentData.numeracy) ? 'Yes' : 'No')+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+((studentData.social) ? 'Yes' : 'No')+'</td>'+
                                       '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 8px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+studentData.teachers_name+'</td>'+
                                       '</tr>';

                               asyncStudentCallback();
                             },function(err){
                                if(err){
                                   asyncSchoolCallback(err); 
                                }else{
                                    html +='</table></br>';
                                    asyncSchoolCallback();
                                }
                             });
         

                              
                       },function(err){
                           if(err){
                             asyncDistCallback(err);
                           }else{
                             
                              asyncDistCallback();
                           }
                       });

                
                },function(err){
                    if(err){
                      asyncCountyCallback(err);
                    }else{
                         
                        html +='</div></div></body></html>';
                      districtslib.exportPdf({html:html,file_name:data.file_name},function(err,pdfResult){
                        if(err){
                           res.json({
                                 success: false,
                                 data: [],
                                 message: err
                            });
                        }else{
                           res.json({
                                success: true,
                               // data: results2,
                                data:pdfResult,
                                message: 'Detailed Report Second.'
                            });
                        }
                     });
                    }
                });
               
       
             }
        
    });
};


exports.extractParamsForDetailedReportThird = function(req, res, next) {
    var counties = req.store.counties;
    var districts = req.store.districts;
    var schools = req.store.schools;
    var schools_count = req.store.schools_count;
    var districts_count = req.store.districts_count;
    var counties_count = req.store.counties_count;
    var results1 = [];
    var results2 = [];
    var reqData = req.body;


    for (var i = 0; i < counties.length; i++) {

        results1[i] = {};

        if (counties[i]._id && counties[i].name) {

            results1[i].districts_new = [];

            for (var j = 0; j < districts.length; j++) {

                if (districts[j] && districts[j].name && districts[j].countyId) {

                    if (counties[i]._id.toString() === districts[j].countyId.toString()) {

                        var schools_new = [];

                        for (var k = 0; k < schools.length; k++) {

                            if (districts[j]._id && schools[k].distId) {

                                if (districts[j]._id.toString() === schools[k].distId.toString()) {

                                    if (schools[k]) {

                                        schools_new.push(schools[k]);
                                    }
                                }
                            }
                        }
                        if (schools_new && schools_new.length > 0 && counties[i]._id) {
                            districts[j].schools_new = schools_new;
                            results1[i].county_id = counties[i]._id;
                            results1[i].county_name = counties[i].name;
                            results1[i].isOther = (counties[i].isOther) ? counties[i].isOther : false;
                            results1[i].districts_new.push(districts[j]);
                        }
                    }
                }
            }

        }
    }
    for (var i = 0; i < results1.length; i++) {
        if (results1[i].districts_new) {
            if (results1[i].districts_new.length > 0) {
                results2.push(results1[i]);
            }
        }
    }

    var html = '<!DOCTYPE html><html>';
    html +='<head><meta charset="utf-8"><title>PDF Report</title></head>';
    html +='<div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">';
    html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Counties / Districts / Schools</div>';
    html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';

    html +='<div class="header-bottom" style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
           '<font class="pull-left" style="float:left;">'+reqData.year+' KRS Assessments</font>'+
           '<font class="pull-right" style="float:right">Generated on '+reqData.current_date+'</font>'+
           '</div>';

    /*
    *Summary
    */
    html +='<div class="table-container margin-top-30" style="border:#d8d8d8 1px solid; margin: 30px 40px;">'+
            '<h1 style="text-align: center; font-size: 20px;">Summary</h1>'+
            '<table style="width:100%; border-collapse:collapse; ">'+
            '<tr style="background: #ebebeb;">'+
            '<td style="width:29%; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Number of Counties</td>'+
            '<td style="width:29%; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Number of Districts</td>'+
            '<td style="width:29%; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Number of Schools</td>'+
            '</tr>'+
            '<tr style="background: #f9f9f9;">'+
            '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+counties_count+'</td>'+  
            '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+districts_count+'</td>'+  
            '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schools_count+'</td>'+  
            '</tr>'+
            '</table>'+
            '</div>';

   
   

    
      async.forEachOf(results2, function (countyData, countyKey, asyncCountyCallback) {
        var countyName = (countyData.isOther) ? ('Other('+countyData.county_name+')') : countyData.county_name;
        html +='<div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 40px;">';
        html +='<h1 class="text-left padding-left" style="text-align: left !important; padding-left: 10px; font-size:20px;">'+countyName+'</h1>';
        
            async.forEachOf(countyData.districts_new, function (distData, distKey, asyncDistCallback) {
              html +='<p class="padding-left" style="padding-left: 10px; margin-top:0px;">'+distData.name+'</p>';  
              html +='<table style="width:100%; border-collapse:collapse; ">'+
                     '<tr style="background: #ebebeb;">'+
                     '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">School</td>';
                 async.forEachOf(distData.schools_new, function (shoolData, schoolKey, asyncShoolCallback) {
                 html +='<tr style="background: #f9f9f9;">'+
                        '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+shoolData.name+'</td>'+
                        '</tr>';

                 asyncShoolCallback();
               },function(err){
                   if(err){
                     asyncDistCallback(err);
                   }else{
                     html +='</tr></table></br>';
                      asyncDistCallback();
                   }
               });
      

            
            },function(err){
               if(err){
                 asyncCountyCallback(err);
               }else{
                  html +='</div></br>'
                  asyncCountyCallback();
               }
            });

       
      },function(err){
          if(err){
             res.json({
                        'success': false,
                         data: [],
                         message: err
                    });
          }else{
              html +='</div></html>';
               districtslib.exportPdf({html:html,file_name:reqData.file_name},function(err,pdfResult){
                        if(err){
                           res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });
                        }else{
                           res.json({
                                'success': true,
                                data: pdfResult,
                                message: 'Detailed Report Third.'
                            });
                        }
                     });
          }
      })

   


    // res.json({
    //     'success': true,
    //     data: results2,
    //     counties_count: counties_count,
    //     districts_count: districts_count,
    //     schools_count: schools_count,
    //     message: 'Detailed Report Third.'
    // });
};


exports.extportDetailReportFourth = function(req, res, next){
   var reqData = req.body;
  var teachersArr = [];
  var literacyArr = [];
  var numeracyArr = [];
  var socialArr = [];
  var countyArr = [];
  var districtArr = [];
  var global_average_completion = [];
  var countyReportData = [];


     async.waterfall([
         
         function literacy(callback){
             var literacyCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        literacyCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  literacylib.getStudents(literacyCondition,function(err,literacy) {
                    if (err) {
                     callback(err);
                    }else{
                       literacyArr = literacy;
                      callback(null,literacy);
                    }
                  });   
             
            },
            function numeracy(literacy, callback){
             var numeracyCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        numeracyCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  numeracylib.getStudents(numeracyCondition,function(err,numeracy) {
                    if (err) {
                     callback(err);
                    }else{
                       numeracyArr = numeracy;
                      callback(null,literacy, numeracy);
                    }
                  });   
             
            },
            function social(literacy, numeracy, callback){
             var socialCondition = {active:true, enabled: true};
                      if(reqData.from_date && reqData.to_date){
                        socialCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                      }

                  sociallib.getStudents(socialCondition,function(err,social) {
                    if (err) {
                     callback(err);
                    }else{
                      socialArr = social;
                      callback(null,literacy, numeracy, social);
                    }
                  });   
             
            },
          function county(literacy, numeracy, social, callback){
             var  countyCondition = {active:true, enabled: true};
                    // if(reqData.from_date && reqData.to_date){
                    //   countyCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                    // }
                  districtslib.getCounties(countyCondition,function(err,counties) {
                    if (err) {
                     callback(err);
                    }else{
                        async.forEachOf(counties, function(countyData, countyKey, asynCountyCallback) {
                             var counties_literacy = 0;
                             var counties_numeracy = 0;
                             var counties_social = 0;
                            global_average_completion.push({county_literacy:counties_literacy, county_numeracy:counties_numeracy, county_social:counties_social, county_name: countyData.name, literacy_students:0, numeracy_students:0, social_students:0});
                          
                            countyReportData.push({county_name: countyData.name,isOther:((countyData.isOther) ? countyData.isOther : false), county_id:countyData._id, districts_new:[]});
                            var distCondition =  {active:true, enabled: true, countyId:utils.toObjectId(countyData._id)};
                             // if(reqData.from_date && reqData.to_date){
                             //      distCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                             //    }
                               districtslib.getDistricts(distCondition,function(err,districts){
                               if(err){
                                   asynCountyCallback(err);
                                 }else{
                                    countyReportData[countyKey].districts_new = districts;
                                     async.forEachOf(districts, function(distData, distKey, asynDistCallback) {
                                        var schoolCondition =  {active:true, enabled: true, distId:utils.toObjectId(distData._id)};
                                         // if(reqData.from_date && reqData.to_date){
                                         //      schoolCondition.createdIso = {$gte:reqData.from_date, $lte:reqData.to_date};
                                         //    }
                                       schoolslib.getSchools(schoolCondition,function(err,schooles){
                                        if(err){
                                            asynDistCallback(err);
                                          }else{
                                              countyReportData[countyKey].districts_new[distKey].schools_new = schooles; 
                                              async.forEachOf(schooles, function(schoolData, schoolKey, asynschoolCallback) {
                                                 var literacyRecord = literacy.filter(function(schoolObj) {
                                                        return schoolObj.schoolId.toString() === schoolData._id.toString();
                                                    });

                                                 global_average_completion[countyKey].county_literacy += literacyRecord.length;


                                                 var literacy_percentage = ((literacyRecord.length / literacy.length) * 100).toFixed(2);
                                                 countyReportData[countyKey].districts_new[distKey].schools_new[schoolKey].literacy = (literacy_percentage=="NaN") ? "0.00" : literacy_percentage;

                                                  var numeracyRecord = numeracy.filter(function(numObj) {
                                                        return numObj.schoolId.toString() === schoolData._id.toString();
                                                    });
                                                   global_average_completion[countyKey].county_numeracy += numeracyRecord.length;


                                                   var numeracy_percentage = ((numeracyRecord.length / numeracy.length) * 100).toFixed(2);
                                                   countyReportData[countyKey].districts_new[distKey].schools_new[schoolKey].numeracy =  (numeracy_percentage=="NaN") ? "0.00" : numeracy_percentage;

                                                    var socialRecord = social.filter(function(socObj) {
                                                        return socObj.schoolId.toString() === schoolData._id.toString();
                                                    });
                                                   global_average_completion[countyKey].county_social += socialRecord.length;
                                                   
                                                    var social_percentage = ((socialRecord.length/social.length)*100).toFixed(2);
                                                   countyReportData[countyKey].districts_new[distKey].schools_new[schoolKey].social = (social_percentage=="NaN") ? "0.00" : social_percentage;
                                                  
                                                        global_average_completion[countyKey].literacy_students = literacy.length;
                                                        global_average_completion[countyKey].numeracy_students = numeracy.length;
                                                        global_average_completion[countyKey].social_students = social.length;
                                                        asynschoolCallback();
                                                             
                                                   
                                              },function(err){
                                                  if(err){
                                                    asynDistCallback(err);
                                                  }else{
                                                     asynDistCallback();
                                                  }
                                              });


                                             
                                          }
                                         });

                                       
                                     },function(err){
                                         if(err){
                                             asynDistCallback(err);
                                         }else{
                                              asynCountyCallback();
                                         }
                                     });


                                    
                                 }
                             });
                         
                        },function(err){
                            if(err){
                                  callback(err);
                            }else{
                               countyArr = counties;
                               callback(null,literacy, numeracy, social, counties);
                            }
                        });

                      
                    }
                  });   
             
            }], function (err, result) {
                if(err){
                  res.json({success:false,data:[],message:'Something went wrong.'});
                }else{


   var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF Report</title></head>';
       html +='<div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">'; 
       html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Assessments Completion Progress</div>';
       html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';
  
       html +='<div class="header-bottom" style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
        '<font class="pull-left" style="float:left;">'+reqData.year+' KRS Assessments</font>'+
        '<font class="pull-right" style="float:right">Generated on '+reqData.current_date+'</font>'+
        '</div>';

        html +='<div class="table-container margin-top-30" style="border:#d8d8d8 1px solid; margin: 30px 40px;">'+
               '<h1 style="text-align: center; font-size: 20px;">Global Average Completion Results - By County</h1>'+
               '<table style="width:100%; border-collapse:collapse; ">'+
               '<tr style="background: #f9f9f9;">'+
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">County</td>'+
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Literacy</td>'+   
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Numeracy</td>'+ 
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Social</td>'+                                                     
               '</tr>';


               global_average_completion.forEach(function(county){ 
                var countyLitAvgPecentage = (parseFloat(county.county_literacy)/parseInt(county.literacy_students)*100).toFixed(2);
                    countyLitAvgPecentage = (countyLitAvgPecentage!='NaN') ? countyLitAvgPecentage : '0.00';
                    countyLitAvgPecentage = isFinite(countyLitAvgPecentage) ? countyLitAvgPecentage : '0.00';
               
                var countyNumeracyPercent = (parseFloat(county.county_numeracy)/parseInt(county.numeracy_students)*100).toFixed(2); 
                 countyNumeracyPercent = (countyNumeracyPercent!='NaN') ? countyNumeracyPercent : '0.00'; 
                 countyNumeracyPercent = isFinite(countyNumeracyPercent) ? countyNumeracyPercent : '0.00'; 

                 var countySocialPercent = (parseFloat(county.county_social)/parseInt(county.social_students)*100).toFixed(2);
                 countySocialPercent = (countySocialPercent!='NaN') ? countySocialPercent : '0.00';   
                 countySocialPercent = isFinite(countySocialPercent) ? countySocialPercent : '0.00'; 

                  html +='<tr>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+county.county_name+'</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+countyLitAvgPecentage+'%</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+countyNumeracyPercent+'%</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+countySocialPercent+'%</td>';
                  html +='</tr>';
               });     
            html +='</table></div>';
            html +='<h1 class="detalied-report" style="width: 100%; text-align: center; font-size: 20px; margin-bottom: 6px; margin-top: 30px;">Detailed Report</h1>';
         

           async.forEachOf(countyReportData, function (countyData, key, asyncCountyCallback) {

                var countyName = (countyData.isOther) ? ('Other('+countyData.county_name+')') : countyData.county_name;
                html += ' <div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 40px;">';
                html +='<h1 class="text-left padding-left" style="text-align: left !important; padding-left: 10px; font-size:20px;">'+countyName+'</h1>';
                

               
                 async.forEachOf(countyData.districts_new, function (distData, key, asyncDistCallback) {
                    html +='<p style="padding-left: 10px;">'+distData.name+'</p>'; 

                     html +='<table style="width:100%; border-collapse:collapse; ">'+
                       '<tr style="background: #f9f9f9;">'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">School</td>'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Literacy</td>'+   
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Numeracy</td>'+ 
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Social</td>'+                                                     
                       '</tr>';
                     var schoolCount = 1;  
                     var literacyPercent = 0;
                     var numeracyPercent = 0;
                     var socialPercent = 0;
                     async.forEachOf(distData.schools_new, function (schoolData, key, asyncSchoolCallback) {
                          html +='<tr>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.literacy+'%</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.numeracy+'%</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.social+'%</td>';
                          html +='</tr>';
                          literacyPercent +=(schoolData.literacy) ? schoolData.literacy : 0;
                          numeracyPercent +=(schoolData.numeracy) ? schoolData.numeracy : 0;
                          socialPercent +=(schoolData.social) ? schoolData.social : 0;
                          if(schoolCount==distData.schools_new.length){
                            var literacyOverAllAvg = (parseFloat(literacyPercent)/distData.schools_new.length);
                            var numeracyOverAllAvg = (parseFloat(numeracyPercent)/distData.schools_new.length);
                            var socialOverAllAvg = (parseFloat(socialPercent)/distData.schools_new.length);

                            literacyOverAllAvg = (literacyOverAllAvg!='NaN') ? literacyOverAllAvg : '0.00';
                            numeracyOverAllAvg = (numeracyOverAllAvg!='NaN') ? numeracyOverAllAvg : '0.00';
                            socialOverAllAvg = (socialOverAllAvg!='NaN') ? socialOverAllAvg : '0.00';
                             html +='<tr>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;"><b>Overall Average</b></td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+literacyOverAllAvg.toFixed(2)+'%</td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+numeracyOverAllAvg.toFixed(2)+'%</td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+socialOverAllAvg.toFixed(2)+'%</td>';
                             html +='</tr>';
                          }
                       schoolCount++;
                      asyncSchoolCallback();
                     },function(err){
                        if(err){
                          asyncDistCallback(err);
                        }else{
                            html +='</table>';
                          asyncDistCallback();
                        }
                     });

                  
                 },function(err){
                     if(err){
                       asyncCountyCallback(err);
                     }else{
                      html +='</div></br>';
                      asyncCountyCallback(); 
                     }
                 });


                
            }, function (err) {
                if (err) {
                     res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });
                }else{
                 

                  html +='</div></html>'

   
                     districtslib.exportPdf({html:html,file_name:reqData.file_name},function(err,pdfResult){
                        if(err){
                           res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });
                        }else{
                           res.json({
                                'success': true,
                                data: pdfResult,
                                message: 'Assessments Completion Progress.'
                            });
                        }
                     });
                }

                 
            });

                    //res.json({success:true, data:countyReportData, message:'Assessments Completion Progress.'});
                }
                
              });
};

exports.extractParamsForDetailedReportFourth = function(req, res, next) {
    var counties = req.store.counties;
    var districts = req.store.districts;
    var schools = req.store.schools;
    var numeracy = req.store.numeracy;
    var literacy = req.store.literacy;
    var social = req.store.social;
    var social_count = req.store.social_count;
    var literacy_count = req.store.literacy_count;
    var students_count = req.store.students_count;
    var numeracy_count = req.store.numeracy_count;
    var results1 = [];
    var results2 = [];
    var global_average_completion = []; 
    var reqData = req.body;

    for (var i = 0; i < counties.length; i++) {

        var counties_literacy = 0;
        var counties_numeracy = 0;
        var counties_social = 0;

        results1[i] = {};

        global_average_completion[i] = {};

        if (counties[i]._id && counties[i].name) {

            results1[i].districts_new = [];

            for (var j = 0; j < districts.length; j++) {

                if (districts[j] && districts[j].name && districts[j].countyId) {

                    if (counties[i]._id.toString() === districts[j].countyId.toString()) {

                        var schools_new = [];

                        for (var k = 0; k < schools.length; k++) {

                            if (districts[j]._id && schools[k].distId) {

                                if (districts[j]._id.toString() === schools[k].distId.toString()) {

                                    if (schools[k]) {
                                        // For litearcy Percentage
                                        schools[k].literacy = 0;
                                        var literacyPoorNumRecord = literacy.filter(function(obj) {
                                            return obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        if (literacyPoorNumRecord.length > 0) {
                                            var literacy_percentage = ((parseInt(literacyPoorNumRecord.length) / parseInt(literacy_count)) * 100).toFixed(2);
                                            schools[k].literacy = literacy_percentage;

                                            counties_literacy += parseInt(schools[k].literacy);

                                        }

                                        // For Numeracy Percentage
                                        schools[k].numeracy = 0;
                                        var numeracy_record = numeracy.filter(function(obj) {
                                            return obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        if (numeracy_record.length > 0) {
                                            var numeracy_percentage = ((parseInt(numeracy_record.length) / parseInt(numeracy_count)) * 100).toFixed(2);
                                            schools[k].numeracy = numeracy_percentage;
                                            counties_numeracy += parseInt(schools[k].numeracy);
                                        }

                                        // For Social Percentage
                                        schools[k].social = 0;
                                        var social_record = social.filter(function(obj) {
                                            return obj.schoolId.toString() === schools[k]._id.toString();
                                        });
                                        if (social_record.length > 0) {
                                            var social_percentage = ((parseInt(social_record.length) / parseInt(social_count)) * 100).toFixed(2);
                                            schools[k].social = social_percentage;
                                            counties_social += parseInt(schools[k].social);
                                        }

                                        schools_new.push(schools[k]);
                                    }
                                }else{
                                schools_new = [];
                            }
                            }
                        }
                        if (schools_new && schools_new.length > 0 && counties[i]._id) {
                            districts[j].schools_new = schools_new;
                            results1[i].county_id = counties[i]._id;
                            results1[i].county_name = counties[i].name;
                            global_average_completion[i].county_literacy = counties_literacy;
                            global_average_completion[i].county_numeracy = counties_numeracy;
                            global_average_completion[i].county_social = counties_social;
                            global_average_completion[i].county_name = counties[i].name;
                            results1[i].districts_new.push(districts[j]);
                        }
                    }
                }else{
                    results1[i].districts_new = [];
                }
            }

        }
        global_average_completion[i].county_literacy = counties_literacy;
        global_average_completion[i].county_numeracy = counties_numeracy;
        global_average_completion[i].county_social = counties_social;
        global_average_completion[i].county_name = counties[i].name;
    } 
    for (var i = 0; i < results1.length; i++) {
        if (results1[i].districts_new) {
            if (results1[i].districts_new.length > 0) {
                results2.push(results1[i]);
            }
        }
    }

 
   var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF Report</title></head>';
       html +='<div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">'; 
       html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Assessments Completion Progress</div>';
       html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';
  
       html +='<div class="header-bottom" style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
        '<font class="pull-left" style="float:left;">'+reqData.year+' KRS Assessments</font>'+
        '<font class="pull-right" style="float:right">Generated on '+reqData.current_date+'</font>'+
        '</div>';

        html +='<div class="table-container margin-top-30" style="border:#d8d8d8 1px solid; margin: 30px 40px;">'+
               '<h1 style="text-align: center; font-size: 20px;">Global Average Completion Results - By County</h1>'+
               '<table style="width:100%; border-collapse:collapse; ">'+
               '<tr style="background: #f9f9f9;">'+
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">County</td>'+
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Literacy</td>'+   
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Numeracy</td>'+ 
               '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Social</td>'+                                                     
               '</tr>';
               
               global_average_completion.forEach(function(county){ 
                  html +='<tr>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+county.county_name+'</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+county.county_literacy+'%</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+county.county_numeracy+'%</td>';
                  html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+county.county_social+'%</td>';
                  html +='</tr>';
               });     
            html +='</table></div>';
            html +='<h1 class="detalied-report" style="width: 100%; text-align: center; font-size: 20px; margin-bottom: 6px; margin-top: 30px;">Detailed Report</h1>';
         

           async.forEachOf(results2, function (countData, key, asyncCountyCallback) {
                html += ' <div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 40px;">';

                html +='<h1 class="text-left padding-left" style="text-align: left !important; padding-left: 10px; font-size:20px;">'+countData.county_name+'</h1>';
                

               
                 async.forEachOf(countData.districts_new, function (distData, key, asyncDistCallback) {
                    html +='<p style="padding-left: 10px;">'+distData.name+'</p>'; 

                     html +='<table style="width:100%; border-collapse:collapse; ">'+
                       '<tr style="background: #f9f9f9;">'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">School</td>'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Literacy</td>'+   
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Numeracy</td>'+ 
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">Social</td>'+                                                     
                       '</tr>';
                     var schoolCount = 1;  
                     var literacyPercent = 0;
                     var numeracyPercent = 0;
                     var socialPercent = 0;
                     async.forEachOf(distData.schools_new, function (schoolData, key, asyncSchoolCallback) {
                          html +='<tr>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.name+'</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.literacy+'%</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.numeracy+'%</td>';
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+schoolData.social+'%</td>';
                          html +='</tr>';
                          literacyPercent +=(schoolData.literacy) ? schoolData.literacy : 0;
                          numeracyPercent +=(schoolData.numeracy) ? schoolData.numeracy : 0;
                          socialPercent +=(schoolData.social) ? schoolData.social : 0;
                          if(schoolCount==distData.schools_new.length){
                            var literacyOverAllAvg = (literacyPercent/distData.schools_new.length);
                            var numeracyOverAllAvg = (numeracyPercent/distData.schools_new.length);
                            var socialOverAllAvg = (socialPercent/distData.schools_new.length);
                             html +='<tr>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;"><b>Overall Average</b></td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+literacyOverAllAvg.toFixed(2)+'%</td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+numeracyOverAllAvg.toFixed(2)+'%</td>';
                             html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 12px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">'+socialOverAllAvg.toFixed(2)+'%</td>';
                             html +='</tr>';
                          }
                       schoolCount++;
                      asyncSchoolCallback();
                     },function(err){
                        if(err){
                          asyncDistCallback(err);
                        }else{
                            html +='</table>';
                          asyncDistCallback();
                        }
                     });

                  
                 },function(err){
                     if(err){
                       asyncCountyCallback(err);
                     }else{
                      html +='</div></br>';
                      asyncCountyCallback(); 
                     }
                 });


                
            }, function (err) {
                if (err) {
                     res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });
                }else{
                 

                  html +='</div></html>'

   
                     districtslib.exportPdf({html:html,file_name:reqData.file_name},function(err,pdfResult){
                        if(err){
                           res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });
                        }else{
                           res.json({
                                'success': true,
                                data: pdfResult,
                                message: 'Assessments Completion Progress.'
                            });
                        }
                     });
                }

                 
            });

      

    // res.json({
    //     'success': true,
    //     data: results2,
    //     data1:global_average_completion,
    //     message: 'Assessments Completion Progress.'
    // });
 

};

exports.exportGreenYelloRedPdfReport = function(req, res, next) {
     var data = req.body;
      var html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>PDF Report</title></head>';
       html +='<body><div class="container-box" style="width:580px; border:1px black solid;margin:0 auto; padding:0px 1px 20px 1px; font-family: arial">'; 
       html +='<div class="top-header" style="width: 100%; height: 77px; background:#aaaaaa; text-align: center;  font-size: 30px;color: white; line-height: 61px;">Assessments Completion Progress</div>';
       html +='<div class="header-middle" style="width: 100%; height: 50px; background:#d6d6d6; text-align: center;font-size: 30px; color: gray; line-height: 50px;">First 5 Shasta - KRS</div>';
  
       html +='<div class="header-bottom" style="height: 40px; background:#ebebeb; text-align: left; font-size: 16px;  color: gray; line-height: 40px;padding-left:10px; padding-right:10px;">'+
        '<font class="pull-left" style="float:left;">'+data.year+' KRS Assessments</font>'+
        '<font class="pull-right" style="float:right">Generated on '+data.current_date+'</font>'+
        '</div><br>';



        
         async.forEachOf(data.data, function (countyData, countyKey, asyncCountyCallback) {
                html += ' <div class="table-container" style="border:#d8d8d8 1px solid; margin: 0px 10px;">';

                html +='<h3 class="text-left padding-left" style="text-align: left !important; padding-left: 10px;margin:10px 0px 0px;text-transform: capitalize !important;">'+countyData.name+'</h3>';
                
                  async.forEachOf(countyData.district_new, function (distData, distKey, asyncDistCallback) {
                       html +='<h4 style="padding-left: 10px;text-transform: capitalize !important;margin:4px 0px 0px">'+distData.name+'</h4>';
                       
                         html +='<table style="width:100%; border-collapse:collapse; ">'+
                       '<tr style="background: #f9f9f9;">'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">School</td>'+
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Literacy </br> Red Yellow Green</td>'+   
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Numeracy </br> Red Yellow Green</td>'+ 
                       '<td class="table-heading" style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Soc-Phy-Emo </br> Red Yellow Green</td>'+                                                     
                       '</tr>';
               
                     
                       if(distData.schools_new.length){
                            async.forEachOf(distData.schools_new, function (schoolData, schoolKey, asyncSchoolCallback) {
                                html +='<tr>';
                                html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;text-transform: capitalize !important;" width="20%">'+schoolData.name+'</td>';
                                html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+schoolData.literacy_poor+'% '+schoolData.literacy_good+'% '+schoolData.literacy_very_good+'%</td>';
                                html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+schoolData.numeracy_poor+'% '+schoolData.numeracy_good+'% '+schoolData.numeracy_very_good+'%</td>';
                                html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+schoolData.social_poor+'% '+schoolData.social_good+'% '+schoolData.social_very_good+'%</td>';
                                html +='</tr>';
                                
                                
                       
                               asyncSchoolCallback(); 
                            },function(err){
                                if(err){
                                  asyncSchoolCallback(err);  
                                }else{
                                    if(distData.districtAvg.length){
                                            html +='<tr>';
                                            html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;text-align: right !important;"> <b>District Average</b></td>';
                                            html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+distData.districtAvg[0].literacyPoor+'% '+distData.districtAvg[0].literacyGood+'% '+distData.districtAvg[0].literacyVeryGood+'%</td>';
                                            html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+distData.districtAvg[0].numeracyPoor+'% '+distData.districtAvg[0].numeracyGood+'% '+distData.districtAvg[0].numeracyVeryGood+'%</td>';
                                            html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+distData.districtAvg[0].socialPoor+'% '+distData.districtAvg[0].socialGood+'% '+distData.districtAvg[0].socialVeryGood+'%</td>';
                                            html +='</tr>';
                                        }
                                     html +='</table>';
                                    asyncDistCallback(); 
                                }
                            });
                       }else{
                           html += '<tr style="background: #f9f9f9;">'+
                                    '<td colspan="4" style="text-align:center; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;">No School Found.</td>'+
                                    '</tr>'; 
                           html +='</table>';
                          asyncDistCallback(); 
                       }
                       
                      
                  },function(err){
                      if(err){
                          asyncDistCallback(err);
                      }else{
                          // html +='</div>';
                           asyncCountyCallback(); 
                      }
                  });
             
                 /*
                  * County AVG HTML
                  */
                 
                 html +='<br><div>';
                 html +=' <div><h4 style="margin:4px 10px 4px">County Average</h4></div>';
                 html +='<table style="width:100%; border-collapse:collapse; ">';
                 html +='<tr style="background: #f9f9f9;">'+
                            '<td style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;"></td>'+
                            '<td style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Literacy<br> Red Yellow Green</td>'+
                            '<td style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Numeracy<br> Red Yellow Green</td>'+
                            '<td style="font-weight: bold; padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 10px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">Social<br> Red Yellow Green</td>'+
                          '</tr>';
                 html +='<tr>';
                 html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all;"></td>';
                    
                    if(countyData.countyAvg){      
                          html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+countyData.countyAvg[0].countyLiteracyPoorAvgPercent+'% '+countyData.countyAvg[0].countyLiteracyGoodAvgPercent+'% '+countyData.countyAvg[0].countyLiteracyVeryGoodAvgPercent+'%</td>'+
                          '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+countyData.countyAvg[0].countyNumeracyPoorAvgPercent+'% '+countyData.countyAvg[0].countyNumeracyGoodAvgPercent+'% '+countyData.countyAvg[0].countyNumeracyVeryGoodAvgPercent+'%</td>'+
                          '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">'+countyData.countyAvg[0].countySocialPoorAvgPercent+'% '+countyData.countyAvg[0].countySocialGoodAvgPercent+'% '+countyData.countyAvg[0].countySocialVeryGoodAvgPercent+'%</td>';
                    }else{
                           html +='<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">0.00% 0.00% 0.00%</td>'+
                          '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">0.00% 0.00% 0.00%</td>'+
                          '<td style="padding:7px; border:#d3d2d2 1px solid;border-left:0px;border-right:0px;font-size: 9px; white-space: pre-wrap;word-wrap: break-word;word-break: break-all; text-align:center">0.00% 0.00% 0.00%</td>'; 
                    }
                 html +='</tr>';
                 html +='</table>';
                 html +='</div></div><br>';
             
              
                },function(err){
                    if(err){
                      res.json({
                                'success': false,
                                 data: [],
                                 message: err
                            });  
                    }else{
                         html +='</div></body></html>';
                            districtslib.exportPdf({html:html,file_name:data.file_name},function(err,pdfResult){
                                              if(err){
                                                 res.json({
                                                      'success': false,
                                                       data: [],
                                                       message: err
                                                  });
                                              }else{
                                                 res.json({
                                                      'success': true,
                                                      data: pdfResult,
                                                      message: 'Green, Yellow & Red Lights Results Report.'
                                                  });
                                              }
                                           });
                    }
                });




      
};