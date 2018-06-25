'use strict';

var StudentsSchema  = require('../../lib/db/schema/students');
var studentslib     = require('../../lib/db/students');
var literacylib = require('../../lib/db/literacy');
var numeracylib = require('../../lib/db/numeracy');
var sociallib = require('../../lib/db/social');
var teacherslib = require('../../lib/db/teachers');
var utils           = require('../../lib/utils');
var _               = require('underscore');
var config          = require('../../config/config');
var BadRequest      = require('../../errors/errors').BadRequest;
var errMsg          = require('../../errors/errorCodes');
var async = require('async');


exports.extractParams = function(req, res, next) {
  var keys = ['firstName', 'lastName', 'email', 'gender', 'dob', 'preSchool', 'firstLanguage','iep','transitionalKindergarten'];

  var studentsSchema = new StudentsSchema();
  _.extend(studentsSchema, _.pick(req.body, keys));

  utils.trim(studentsSchema);

  req.store.set('students', studentsSchema);
  next();
};


exports.validations = function(req, res, next) {

  var students = req.store.get('students');

  if(!students.firstName) {
    return next(new BadRequest(errMsg['1005'], 1005));
  }
  if(!students.lastName) {
    return next(new BadRequest(errMsg['1006'], 1006));
  }
  if(!students.gender) {
    return next(new BadRequest(errMsg['1007'], 1007));
  }
  if(!students.dob) {
    return next(new BadRequest(errMsg['1008'], 1008));
  }
  if(!utils.isValidDate(students.dob)) {
    return next(new BadRequest(errMsg['1009'], 1009));
  }
  if (!utils.isGrnderValid(students.gender)) {
    return next(new BadRequest(errMsg['1010'], 1010));
  }

  next();
};

exports.findStudent = function(req, res, next)
{
  var students  = req.store.get('students');
  var teacher   = req.store.get('teacher');
  var query     = {firstName: students.firstName, lastName: students.lastName, teacherId: teacher._id, enabled: true};
  studentslib.findStudent(query, function(err, student) {
    if (err) {
      return next(err);
    }
    if(student) {
      return next(new BadRequest(errMsg['1011'], 1011));
    }
    req.store.set('studentFound', student);
    next();
  });
};

exports.getId = function(req, res, next) {

  var studentId;

  if(req.params.sid) {
    studentId = utils.toObjectId(req.params.sid);
  } else {
    studentId = utils.toObjectId(req.params.id);
  }

  req.store.set('id', studentId);
  next();
};

exports.isStudentExists = function(req, res, next) {

  var studentId = req.store.get('id');

  studentslib.findStudent({_id: studentId, enabled: true}, function(err, student) {
    if (err) {
      return next(err);
    }

    if(!student) {
      return next(new BadRequest(errMsg['1012'], 1012));
    }

    req.store.set('student', student);
    next();
  });
};

exports.create = function(req, res, next) {

  var students = req.store.get('students');
  var teacher = req.store.get('teacher');

  students.teacherId = teacher._id;
  students.schoolId = teacher.schoolId;

  if((students.gender === 'f') || (students.gender === 'female')) {
    students.gender = 'female';
  }

  if((students.gender === 'm') || (students.gender === 'male')) {
    students.gender = 'male';
  }

  students.created = new Date().getTime();
  students.createdIso = new Date().toISOString();
  students.updated = new Date().getTime();
  students.updatedIso = new Date().toISOString();
  students.color = '';
  students.finalScore = '';

  studentslib.create(students, function(err, students) {
    if (err) {
      return next(err);
    }
    res.response = students.shift();
    next();
  });
};

exports.edit = function(req, res, next) {

  var params = req.store.get('students');
  var studentId = req.store.get('student')._id;
  var update = {};

  update.updated = new Date().getTime();
  update.updatedIso = new Date().getTime();

  if(params.firstName) {
    update.firstName = params.firstName;
  }

  if(params.lastName) {
    update.lastName = params.lastName;
  }

  if(params.gender) {
    if(utils.isGrnderValid(params.gender)) {
      update.gender = utils.genderStr(params.gender);
    } else {
      return next(new BadRequest(errMsg['1013'], 1013));
    }
  }

  if(params.dob) {
    if(utils.isValidDate(params.dob)) {
      update.dob = params.dob;
    } else {
      return next(new BadRequest(errMsg['1009'], 1009));
    }
  }
  if(params.preSchool) {
    update.preSchool = params.preSchool;
  }
  if(params.firstLanguage) {
    update.firstLanguage = params.firstLanguage;
  }
  if(params.iep) {
    update.iep = params.iep;
  }
  if(params.transitionalKindergarten) {
    update.transitionalKindergarten = params.transitionalKindergarten;
  }

  studentslib.updateStudent({_id: studentId}, update, function(err, result) {
    if (err) {
      return next(err);
    }

    if(result>0) {
      req.store.set('students', _.extend(req.store.get('student'), update));
    } else {
      req.store.set('students', []);
    }

    next();
  });
};

exports.updateScore = function(req, res, next) {
  var student = req.store.get('student');
  var literacyScore = req.store.numeracyScore;
  var numeracyScore = req.store.literacyScore;
  var socialScore = req.store.socialScore;
  var finalScoreRange = config.finalScore.answer;
  var color;

  if(literacyScore && numeracyScore && socialScore) {

    var total = parseInt(literacyScore, 10) + parseInt(numeracyScore, 10) + parseInt(socialScore, 10);
    if(total > finalScoreRange[1]) {
      color = 1;
    } else if(total < finalScoreRange[0]) {
      color = 0;
    } else {
      color = 2;
    }

    studentslib.updateStudent({_id: student._id}, {color: color, finalScore: total}, function(err) {
      if (err) {
        return next(err);
      }
      next();
    });
  } else {
    return  next();
  }
};

exports.deleteStudent = function(req, res, next) {

  var student = req.store.get('student');

  studentslib.updateStudent({_id: student._id}, {enabled: false}, function(err) {
    if (err) {
      return next(err);
    }

    student.enabled = false;
    res.response = student;
    next();
  });
};

exports.studentRes = function(req, res, next) {
  var students = req.store.get('students');

  res.response = students;
  next();
};

exports.getStudents = function(req, store, next) {

  var teacher = req.store.teacher;
  var query = {teacherId: teacher._id, enabled: true};
  var limit = +req.query.limit || 100;
  var skip = +req.query.skip;
  var options = {limit: limit, skip : skip};
  var sort = {lastName : 1};

  studentslib.getSortedStudent(query, options, sort, function(err, students) {
    if (err) {
      return next(err);
    }

    var studentsIds = students.map(function(studentId) {
      return studentId._id;
    });

    req.store.set('students', students);
    req.store.set('studentIds', studentsIds);
    next();
  });
};

exports.getGreenlights = function(req, res, next) {
  var teacher = req.store.teacher;
  var green = 1;

  var query = {teacherId: teacher._id, enabled: true, color: green};
  studentslib.getSortedStudent(query, {}, {}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(students.length) {
      req.store.set('greenLights', students.length);
    }

    next();
  });
};

exports.finalResult = function(req, res, next) {
  var studentsArr = req.store.get('students');
  var total;

  studentsArr.forEach(function(student) {

    if(!student.literacy) {
      student.literacy = null;
    }

    if(!student.numeracy) {
      student.numeracy = null;
    }

    if(!student.social) {
      student.social = null;
    }

    if(student.literacy && student.numeracy && student.social) {
      total = student.literacy.score + student.numeracy.score + student.social.score;
    } else {
      total = null;
    }

    student.total = total;
  });

  req.store.students = studentsArr;
  next();
};

exports.getResponse = function(req, res, next) {
  var studentsArr = req.store.students;
  res.response = studentsArr;
  next();
};

exports.isDupName = function(req, res, next) {

  var teacher = req.store.teacher;
  var student = req.store.student;
  var params = req.store.students;
  var first, last;

  if(params.firstName && params.lastName) {
    first = params.firstName;
    last = params.lastName;
  } else if (params.firstName && !params.lastName) {
    first = params.firstName;
    last = student.lastName;
  } else if (!params.firstName && params.lastName) {
    first = student.firstName;
    last = params.lastName;
  }

  if(first && last) {

    var query = {_id: {'$ne': student._id}, firstName: first, lastName: last, teacherId: teacher._id, enabled: true};

    studentslib.findStudentDuplicate(query, function(err, result) {
      if (err) {
        return next(err);
      }
      if(result.length) {
        return next(new BadRequest(errMsg['1011'], 1011));
      } else {
        return next();
      }
    });
  } else {
    return next();
  }
};

exports.getStudentsFromSchools = function(req, res, next) {

  var schools   = req.store.get('schools');
  var schoolIds = req.store.get('schoolIds');
  var query;

  if(req.params.tid) {
    query = {teacherId: req.store.get('teacher')._id, enabled: true};
  } else {
    query = {schoolId: {$in: schoolIds}, enabled: true};
  }

  studentslib.getStudents(query, function(err, students) {
    if (err) {
      return next(err);
    }

    if(students.length) {
      var schoolsGroup = _.groupBy(schools, '_id');
      students.forEach(function(student) {

        if(req.params.sid) {
          student.districtName = _.first(req.store.get('district')).name;
        }

        if(req.params.id || req.params.tid) {
          var key = student.schoolId.toString();
          var schoolName = _.pick(schoolsGroup, key);
          schoolName = schoolName[key];
          student.schoolName = schoolName[0].name;
        }

        delete student.createdIso;
        delete student.updated;
        delete student.updatedIso;
        delete student.color;
        delete student.finalScore;
        delete student.active;
        delete student.enabled;
        //delete student.schoolId;
      });
    }

    req.store.set('students', students);
    next();
  });
};

exports.getAllStudents = function(req, res, next) {
  studentslib.getStudents({enabled: true}, function(err, students) {
    if (err) {
      return next(err);
    }
    req.store.set('students', students);
    next();
  });
};


exports.getLanguages = function(req, res, next) {
    
    res.response = ["English","Spanish","Vietnamese","Filipino","Mandarin","Cantonese","Arabic","Hmong","Korean","Other"];
    next();

  /*studentslib.getStudentLanguages({}, function(err, languages) {
    if (err) {
      return next(err);
    }
    
    res.response = languages;
  });*/
};

exports.getcountbyteacherId = function(req, res, next) {
    var teachers = req.store.get('teachers');
    for (var i = 0; i < teachers.length; i++) {
        studentslib.StudentsCountByTeacherId({teacherId: teachers[i]._id}, function(err, students) {
            if (err) {
              return next(err);
            }
            req.store.set('teachers', students);
        });
    }
};

exports.total_students_count = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    // if(data.from_date && data.to_date){
    //     condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    // } 
    studentslib.StudentsCount(condition,function(err,students_count) {
        if (err) {
         return next(err);
        }else{
            students_count = (students_count) ? students_count : 0;
            req.store.set('students_count', students_count);
            next();
        }
        
    });
};


exports.StudentsByMultipleTeachers = function(req, res, next) {
    if (typeof req.body.tid !== 'undefined') {
        var teacherIdArr = [];
           req.body.tid.forEach(function(result){
            teacherIdArr.push(utils.toObjectId(result));        
        })
        var query = {
            enabled: true,
            active: true,
            //createdIso: {$gte:date_arr[0]+"-06-01T00:00:00.000Z",$lt:date_arr[1]+"-05-31T00:00:00.000Z"}
        };
        if(teacherIdArr.length){
          query.teacherId= {
                $in: teacherIdArr
            }
        }

    } else {
        var query = {
            enabled: true,
            active: true
        };
    }

    if(req.body.from_date && req.body.to_date){
        query.createdIso = {$gte:req.body.from_date, $lte:req.body.to_date};
    } 
    studentslib.getStudents(query, function(err, students) {
        if (err) {
            return next(err);
        }
        req.store.set('students', students);
        next();
    });
};

exports.StudentsByMultipleSchools = function(req, res, next) {
    var query = {};
    if (typeof req.body.sid !== 'undefined') {
        var schoolIdArr = [];
        req.body.sid.forEach(function(result) {
            schoolIdArr.push(utils.toObjectId(result));
        })
        query = {
            schoolId: {
                $in: schoolIdArr
            },
            enabled: true,
            active: true
        };

    } else {
        query = {
            enabled: true,
            active: true
        };
    }

    studentslib.getStudents(query, function(err, students) {
        if (err) {
            return next(err);
        }
        req.store.set('students', students);
        next();
    });
};


exports.getLiteracyNumeracyAndSocial = function(req, res, next){
    var countyObj = {};
    var data = req.body;
    async.waterfall([
            function(callback){
             var literacyCondition = {active : true,enabled : true};
              if(data.from_date && data.to_date){
                  literacyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
              }  
             literacylib.getStudentsByAttr(literacyCondition,{score:1,schoolId:1},function(err,literacy){
                 if(err){
                    callback(err); 
                 }else{
                     countyObj.literacy = literacy;
                     callback(null,literacy);
                 }
             });   
               
            },
            function(literacy, callback){
                var numeracyCondition = {active : true,enabled : true};
                if(data.from_date && data.to_date){
                    numeracyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }  
               numeracylib.getStudentsByAttr(numeracyCondition,{score:1,schoolId:1},function(err,numeracy){
                 if(err){
                    callback(err); 
                 }else{
                     countyObj.numeracy = numeracy;
                     callback(null,literacy, numeracy);
                 }
             });  
            },
            function(literacy, numeracy, callback){
               var socialCondition = {active : true,enabled : true};
                if(data.from_date && data.to_date){
                    socialCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }  
                sociallib.getStudentsByAttr(socialCondition,{score:1,schoolId:1},function(err,social){
                 if(err){
                    callback(err); 
                 }else{
                     countyObj.social = social;
                     callback(null,literacy, numeracy, social);
                 }
             });
            },
            function(literacy, numeracy,social, callback){
                studentslib.StudentsCount({enabled:true, active:true},function(err,students){
                 if(err){
                    callback(err); 
                 }else{
                     countyObj.students = students;
                     callback(null,literacy, numeracy, social,students);
                 }
             });
            }
            
          ], function (err, result) {
            if(err){
              res.json({
                  success:false,
                  data:[],
                  message:err
              });
            }else{
              res.json({
                  success:true,
                  data:countyObj,
                  message:'Literacy, Numeracy And Social'
              });
            }
          });
        

};


exports.getSchoolStudentsByPercent = function(req, res, next) {
    var data = req.body;
    var teachersArr = [];
    async.waterfall([function(callback){
          teacherslib.getTeachers({},function(err,teachers){
              if(err){
                   callback(err);
              }else{
                  teachersArr = teachers;
                 callback(null,teachersArr);  
              }
          });  
             
    }],function (err,result){
        if(err){
            res.json({success:true,data:[],message:err}); 
        }else{
            var condition = {enabled:true, active:true};
   
            if(data.type==='literacy'){
              if(data.percent==='poor'){
                 condition.schoolId = utils.toObjectId(data.school_id); 
                 condition.score = {$lt: data.literacyPoor};  
              }else if(data.percent==='good'){
                 condition.schoolId = utils.toObjectId(data.school_id); 
                 condition.score = {$gt: data.literacyPoor,$lte: data.literacyGood}; 
              }else if(data.percent==='veryGood'){
                 condition.schoolId = utils.toObjectId(data.school_id); 
                 condition.score = {$gt: data.literacyGood}; 
              }  

            literacylib.getStudentsByAttr(condition,{},function(err,students){
                if(err){
                    res.json({success:false,data:[],message:err}); 
                }else{
                       async.forEachOf(students, function(literacyData, studentKey, asynStudentCallback) {
                                studentslib.findStudentByAttr({_id:utils.toObjectId(literacyData.studentId)},function(err,student){
                                    if(err){
                                        asynStudentCallback(err);
                                    }else{
                                        var teacher = teachersArr.filter(function(obj){
                                             return obj._id.toString() === literacyData.teacherId.toString();
                                        });
                                        students[studentKey].teacher = (teacher.length) ? teacher[0] : {};
                                        students[studentKey].student = student;
                                        asynStudentCallback(); 
                                    }
                                });
                               
                            },function(err){
                                if(err){
                                     res.json({success:false,data:[],message:err});
                                }else{
                                   res.json({success:true,data:students,message:'Students list.'});  
                                }
                            });  
                }
            });
            }
            
             if(data.type==='numeracy'){
                    if(data.percent==='poor'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$lt: data.numeracyPoor};  
                    }else if(data.percent==='good'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$gt: data.numeracyPoor,$lte: data.numeracyGood}; 
                    }else if(data.percent==='veryGood'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$gt: data.numeracyGood}; 
                    }  

                  numeracylib.getStudentsByAttr(condition,{},function(err,students){
                      if(err){
                          res.json({success:false,data:[],message:err}); 
                      }else{
                            async.forEachOf(students, function(numeracyData, studentKey, asynStudentCallback) {
                                
                                studentslib.findStudentByAttr({_id:utils.toObjectId(numeracyData.studentId)},function(err,student){
                                    if(err){
                                        asynStudentCallback(err);
                                    }else{
                                         var teacher = teachersArr.filter(function(obj){
                                             return obj._id.toString() === numeracyData.teacherId.toString();
                                        });
                                        students[studentKey].teacher = (teacher.length) ? teacher[0] : {};
                                        students[studentKey].student = student;
                                        asynStudentCallback(); 
                                    }
                                });
                               
                            },function(err){
                                if(err){
                                     res.json({success:false,data:[],message:err});
                                }else{
                                   res.json({success:true,data:students,message:'Students list.'});  
                                }
                            });
                            
                      }
                  });
            }
            
            if(data.type==='social'){
                    if(data.percent==='poor'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$lt: data.socialPoor};  
                    }else if(data.percent==='good'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$gt: data.socialPoor,$lte: data.socialGood}; 
                    }else if(data.percent==='veryGood'){
                       condition.schoolId = utils.toObjectId(data.school_id); 
                       condition.score = {$gt: data.socialGood}; 
                    }  

                  sociallib.getStudentsByAttr(condition,{},function(err,students){
                      if(err){
                          res.json({success:false,data:[],message:err}); 
                      }else{
                           async.forEachOf(students, function(socialData, studentKey, asynStudentCallback) {
                                
                                studentslib.findStudentByAttr({_id:utils.toObjectId(socialData.studentId)},function(err,student){
                                    if(err){
                                        asynStudentCallback(err);
                                    }else{
                                         var teacher = teachersArr.filter(function(obj){
                                             return obj._id.toString() === socialData.teacherId.toString();
                                        });
                                        students[studentKey].teacher = (teacher.length) ? teacher[0] : {};
                                        students[studentKey].student = student;
                                        asynStudentCallback(); 
                                    }
                                });
                               
                            },function(err){
                                if(err){
                                     res.json({success:true,data:[],message:err});
                                }else{
                                   res.json({success:true,data:students,message:'Students list.'});  
                                }
                            });
                      }
                  });
            }
        }
    });
        
};

exports.sendStudentsReportByEmail = function(req, res, next) { 
    var data = req.body;
    var nodemailer  = require('nodemailer');  
    var to       =  data.to;
    var cc       =  data.cc;
    var bcc      =  data.bcc;
    var subject  =  data.subject;
    var message  =  data.message;
    var toarray  =  to.split(',');
    var ccarray  =  cc.split(',');
    var bccarray =  bcc.split(',');
    
     var mailOptions = {
        to: toarray,
        cc: ccarray,
        bcc: bccarray,
        from: 'First 5 Shasta <noreply@ebbex.com>',
        subject: subject,
        html: data.html,
        generateTextFromHtml: true
    };
     
    var options = {
            host: 'smtp.mailgun.org',
            port: 25,
            auth: {
                user: 'kinder@vinfotech.org',
                pass: '852367Yl6Ude'
            }
          };

    var smtpTransport = nodemailer.createTransport(options);
    smtpTransport.sendMail(mailOptions, function (err) {

        if (err) {
            //res.json({success:false,data:[],message:err});
        } else {
           //res.json({success:true,data:[],message:'Email successfully sent.'});
        }
    });
   res.json({success:true,data:[],message:'Email successfully sent.'});
};



