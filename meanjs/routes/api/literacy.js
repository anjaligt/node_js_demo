'use strict';
var utils = require('../../lib/utils');
var _ = require('underscore');
var config = require('../../config/config');
var AssessmentsSchema = require('../../lib/db/schema/assessment');
var literacylib = require('../../lib/db/literacy');
var BadRequest = require('../../errors/errors').BadRequest;
var errMsg = require('../../errors/errorCodes');
var common = require('../../lib/common');

var answersObj;

exports.getAnswers = function(req, res, next) {
  var keys = ['answers', 'parentPresent', 'totalScore', 'createDate', 'nameEachLetter', 'letterSound'];

  var answers = new AssessmentsSchema();

  _.extend(answers, _.pick(req.body, keys));
  utils.trim(answers);

  req.store.set('literacy', answers);

  next();
};

exports.findStudent = function(req, res, next) {
  var student = req.store.get('student');

  literacylib.getStudents({studentId : student._id}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(students.length) {
      return next(new BadRequest(errMsg['1015'], 1015));
    }
    next();
  });
};

exports.validateAssessment = function(req, res, next) {

  var literacy = req.store.get('literacy').answers;
  var answers = config.answers.literacy;
  var questionsCount = 0;

  var nameEachLetter = req.store.get('literacy').nameEachLetter;
  var letterSound = req.store.get('literacy').letterSound;

  if(literacy.length !== answers.length) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  literacy.forEach(function(each) {
    questionsCount = questionsCount + each.length;
  });

  if(questionsCount < config.tolatQuestions.literacy) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  if(nameEachLetter && !_.isArray(nameEachLetter)) {
    return next(new BadRequest('nameEachLetter is ' + errMsg['1022'], 1022));
  }

  if(letterSound && !_.isArray(letterSound)) {
    return next(new BadRequest('letterSound is ' + errMsg['1022'], 1022));
  }

  next();
};

exports.assessment = function(req, res, next) {

  var literacy = req.store.get('literacy').answers;
  var correctAnswers = config.answers.literacy;
  var result;
  var data = [];
  var valid;

  for(var i = 0, len = correctAnswers.length; i < len; ++i) {

    var answers = literacy[i];
    var correct = correctAnswers[i].answer;
    var lights = config.lights;

    // question 1
    if (i === 0) {
      valid = validateAns(answers);
      if(!valid) {
        return next(new BadRequest('question 1 ' + errMsg['1016'], 1016));
      }
      result = literacy1(answers, correct, lights);
      data.push(result);
      valid = true;
    }

    // question 2
    if (i === 1) {
      result = literacy1(answers, lights);
      data.push(result);
    }

    // question 3
    if (i === 2) {
      result = literacy1(answers, correct, lights);
      data.push(result);
    }

    // question 4
    if (i === 3) {
      result = literacy1(answers, correct, lights);
      data.push(result);
    }

    // question 5 (6a & 6b)
    if (i === 4) {
      result = literacy1(answers, correct, lights);
      data.push(result);
    }

    if (i === 5) {
      result = literacy1(answers, correct, lights);
      data.push(result);
    }
  }

  req.store.literacyScore = req.store.get('literacy').totalScore;
  req.store.set('answers', data);
  next();
};

exports.getStudents = function(req, res, next) {

  var student = req.store.get('student');
  var teacher = req.store.get('teacher');

  literacylib.getStudents({studentId : student._id, teacherId: teacher._id}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      req.store.literacyScore = '';
      return next();
    } else {
      req.store.literacyScore = parseInt(_.first(students).totalScore);
    }
    next();
  });
};


exports.storeIndb = function(req, res, next) {

  var literacy = req.store.literacy;

  literacy.answers = req.store.get('answers');
  // literacy.score = req.store.get('score');
  literacy.teacherId = req.store.get('teacher')._id;
  literacy.schoolId = req.store.get('teacher').schoolId;
  literacy.studentId = req.store.get('student')._id;
  literacy.created = new Date().getTime();
  literacy.createdIso = new Date().toISOString();
  literacy.updated = new Date().getTime();
  literacy.updatedIso = new Date().toISOString();

  if(literacy.parentPresent === 'false') {
    literacy.parentPresent = false;
  } else {
    literacy.parentPresent = true;
  }

  literacy.score = +literacy.totalScore;

  literacylib.create(literacy, function(err, literacy) {
    if (err) {
      return next(err);
    }
    res.response = literacy.shift();
    next();
  });
};

exports.getLiteracy = function(req, res, next) {

  var studentIds = req.store.studentIds;
  var studentsArr = req.store.students;

  literacylib.getStudents({studentId : {$in: studentIds}}, function(err, students) {
    if (err) {
      return next(err);
    }

    for (var i = 0; i < studentsArr.length; i++) {

      delete studentsArr[i].teacherId;
      delete studentsArr[i].schoolId;
      delete studentsArr[i].active;
      delete studentsArr[i].enabled;
      delete studentsArr[i].created;
      delete studentsArr[i].createdIso;
      delete studentsArr[i].updated;
      delete studentsArr[i].updatedIso;

      for (var j = 0; j < students.length; j++) {
        if(studentsArr[i]._id.toString() === students[j].studentId.toString()) {
          /*studentsArr[i].literacy = {
            score : students[j].score,
            created: students[j].created
          };*/
          studentsArr[i].literacy = students[j];
          break;
        }
      }
    }
    req.store.set('students', studentsArr);
    next();
  });
};

exports.getResults = function (req, res, next) {
  var teacher = req.store.teacher;

  literacylib.getStudents({teacherId: teacher._id, enabled: true}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      return next();
    }

    var results = [];
    var litAns = _.pluck(students, 'answers');
    var totalScores = _.pluck(students, 'totalScore');

    var average = common.averageCount(totalScores, students.length);

    litAns.forEach(function(answers) {
      var flatAnswers = _.flatten(_.pluck(answers, 'answers'));
      flatAnswers = findCombination(flatAnswers);

      var len = flatAnswers.length;
      for(var i = 0;  i < len; ++i) {

        var eachObj = { green : 0, red: 0, yellow: 0 };
        var ans = compareAnswer(i, flatAnswers[i]);
        results = common.findTotalLighs(i, results, ans, eachObj);
      }
    });

    var literacyObj = {
      literacyData : common.getPercentage(results),
      numberStudents : students.length,
      avgScore : average
    };
    req.store.literacyData = literacyObj;
    next();
  });
};

exports.deleteLiteracy = function(req, res, next) {

  var student = req.store.get('student');

  literacylib.updateLiteracy({studentId: student._id}, {enabled: false}, function(err) {
    if (err) {
      return next(err);
    }

    next();
  });
};

function findCombination (mainArr) {
  var combinationArray = config.combinationArray.literacy;
  var index = 0;
  combinationArray.forEach(function(record) {
    if(record > 1) {
      var sum = 0;
      var i=0;
      for (i = 0; i < record; i++) {
        var ind = index+i;
        sum +=  parseInt(mainArr[ind]);
      }
      index += i;
      mainArr.splice(index, 0, sum.toString());
    }
    index += 1;
  });
  return mainArr;
}

function compareAnswer (index, answer) {

  var correctAnswers = config.reportLogic.literacy[index];

  switch (correctAnswers.boolean) {
    case true:
      if(parseInt(answer, 10) === correctAnswers.answer[0]) {
        return 'green';
      } else {
        return 'red';
      }
      break;
    case false:
      var range = correctAnswers.answer;
      if(parseInt(answer, 10) < range[0]) {
        return 'red';
      } else if(parseInt(answer, 10) > range[1]) {
        return 'green';
      } else {
        return 'yellow';
      }
      break;
  }
}

exports.getLiteracyData = function (req, res, next) {

  var student = req.store.student;
  var literacyObj = {};

  literacylib.getStudents({studentId: student._id}, function(err, literacy) {
    if (err) {
      return next(err);
    }

    if(literacy.length) {
      literacy = _.first(literacy);

      literacyObj = {
        answers : _.pluck(literacy.answers, 'answers'),
        nameEachLetter : literacy.nameEachLetter,
        letterSound: literacy.letterSound,
        parentPresent: literacy.parentPresent
      };
    }

    req.store.set('literacy', literacyObj);
    next();
  });
};

// Function to assesment question 1
// score : 1a + 1b + 1c = 1
// 0-1 red, 2 yellow, 3 green
function literacy1(answers) {

  var combinationArr = [];
  var combination = 0;
  answers.forEach(function(answer) {
    combination += parseInt(answer);
  });

  combinationArr.push(combination.toString());

  answersObj = {
    answers  : answers,
    combination : combinationArr
  };

  return answersObj;
}

function validateAns(arr) {
  var maxlimit = 1;

  for(var i = 0; i < arr.length; i++) {
    if(arr[i] > maxlimit) {
      return false;
    }
  }
  return true;
}

exports.total_litearcy_count = function(req, res, next){
    literacylib.total_literacy_count({active:true, enabled: true},function(err,litearcy_count) {
        if (err) {
         return next(err);
        }else{
            req.store.set('litearcy_count', litearcy_count);
            next();
        }
        
    });
};

exports.getAllLiteracy = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    literacylib.getAllRecord(condition, function(err,literacy) {
        if (err) {
          return next(err);
        }
        req.store.set('literacy', literacy);
        next();
    });
}

exports.getAllLiteracyCount = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    literacylib.LiteracyCount(condition,function(err,literacy_count) {
        if (err) {
            return next(err);
        }
        req.store.set('literacy_count', literacy_count);
        next();
    });
};