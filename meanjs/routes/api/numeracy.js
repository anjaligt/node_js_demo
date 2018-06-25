'use strict';
var utils = require('../../lib/utils');
var _ = require('underscore');
var config = require('../../config/config');
var AssessmentsSchema = require('../../lib/db/schema/assessment');
var numeracylib = require('../../lib/db/numeracy');
var BadRequest = require('../../errors/errors').BadRequest;
var errMsg = require('../../errors/errorCodes');
var common = require('../../lib/common');

var answersObj;

exports.getAnswers = function(req, res, next) {
  var keys = ['answers', 'parentPresent', 'totalScore', 'createDate', 'nameEachNumber'];

  var answers = new AssessmentsSchema();

  _.extend(answers, _.pick(req.body, keys));
  utils.trim(answers);

  req.store.set('numeracy', answers);

  next();
};

exports.findStudent = function(req, res, next) {

  var student = req.store.get('student');

  numeracylib.getStudents({studentId : student._id}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(students.length) {
      return next(new BadRequest(errMsg['1015'], 1015));
    }
    next();
  });
};

exports.getResults = function (req, res, next) {
  var teacher = req.store.teacher;
  var studenIds;
  studenIds = req.store.get('studentIds');

  numeracylib.getStudents({teacherId: teacher._id, enabled: true}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      return next();
    }

    var results = [];
    var numAns = _.pluck(students, 'answers');

    var totalScores = _.pluck(students, 'totalScore');
    var average = common.averageCount(totalScores, students.length);

    numAns.forEach(function(answers) {

      var flatAnswers = _.flatten(_.pluck(answers, 'answers'));
      flatAnswers = findCombination(flatAnswers);
      var len = flatAnswers.length;

      for(var i = 0;  i < len; ++i) {
        var eachObj = { green : 0, red: 0, yellow: 0 };
        var ans = compareAnswer(i, flatAnswers[i]);
        results = common.findTotalLighs(i, results, ans, eachObj);
      }
    });
    var numeracyObj = {
      numeracyData : common.getPercentage(results),
      numberStudents : students.length,
      avgScore : average
    };
    req.store.numeracyData = numeracyObj;
    next();
  });
};

function compareAnswer(index, answer) {
  var correctAnswers = config.reportLogic.numeracy[index];

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

function findCombination (mainArr) {

  var changed = false;

  //changing question 2's ans to find the combination.
  //because question 2 has yes/no answers. So to mach it with its combination have to do this
  if(mainArr[1] === '1') {
    mainArr[1] = '2';
    changed = true;
  }

  var combinationArray = config.combinationArray.numeracy;
  var index = 0;
  var toremove = 0;

  combinationArray.forEach(function(record, j) {
    if(j === 2) {
      toremove = record;
    }

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

  mainArr.splice(toremove, toremove);
  if(changed) {
    mainArr[1] = '1';
  }
  return mainArr;
}

exports.validateAssessment = function(req, res, next) {

  var numeracy = req.store.get('numeracy').answers;
  var answers = config.answers.numeracy;
  var questionsCount = 0;

  var nameEachNumber = req.store.get('numeracy').nameEachNumber;

  if(numeracy.length !== answers.length) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  numeracy.forEach(function(each) {
    questionsCount = questionsCount + each.length;
  });

  if(questionsCount < config.tolatQuestions.numeracy) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  if(nameEachNumber && !_.isArray(nameEachNumber)) {
    return next(new BadRequest('nameEachNumber is ' + errMsg['1022'], 1022));
  }

  next();
};

// 1a, 7a, 15a : 3
// 1, 2, 11
// 8a, 11a + 12a + 13a, 14a = 2
// 3, 7 + 8 + 9, 10
// 9a + 10a = 1
// 4 + 5 + 6
exports.assessment = function (req, res, next) {

  var numeracy = req.store.get('numeracy').answers;
  var correctAnswers = config.answers.numeracy;

  var result;
  var data = [];
  var valid;

  for(var i = 0, len = correctAnswers.length; i < len; ++i) {

    var answers = numeracy[i];
    var correct = correctAnswers[i].answer;
    var values = correctAnswers[i].values;
    var lights = config.lights;


    // question 6a (1)
    if (i === 0) {
      if(!_.contains(correct, parseInt(answers[0]), 10)) {
        return next(new BadRequest('question 1 ' + errMsg['1016'], 1016));
      }

      result = numeracy1(answers, correct, values);
      data.push(result);
    }

    // question 7a (2)
    if (i === 1) {
      if(!_.contains(correct, parseInt(answers[0]), 10)) {
        return next(new BadRequest('question 2 ' + errMsg['1016'], 1016));
      }

      result = ansBinary(answers, correct);
      data.push(result);
    }

    // question 8a (3)
    if (i === 2) {
      var maxAnsRange = 4;
      if( answers[0] > maxAnsRange) {
        return next(new BadRequest('question 3 ' + errMsg['1016'], 1016));
      }
      result = numeracy2(answers, correct, lights);
      data.push(result);
    }

    // question 9a + 10a  (4 + 5 + 6)
    if (i === 3) {
      valid = validateAns(answers);
      if(!valid) {
        return next(new BadRequest('question 4 ' + errMsg['1016'], 1016));
      }
      result = numeracy3(answers, correct, lights);
      data.push(result);

      valid = true;
    }

    // question 11a + 12a +13a (7 + 8 + 9)
    if (i === 4) {

      valid = validateAns(answers);

      if(!valid) {
        return next(new BadRequest('question 5 ' + errMsg['1016'], 1016));
      }

      result = numeracy3(answers, correct, lights);
      data.push(result);

      valid = true;
    }

    // question 14a
    if (i === 5) {

      if(!_.contains(correct, parseInt(answers[0]), 10)) {
        return next(new BadRequest('question 6 ' + errMsg['1016'], 1016));
      }
      result = numeracy4(answers, correct, lights);
      data.push(result);
    }

    if (i === 6) {
      result = numeracy2(answers, correct, lights);
      data.push(result);
    }
  }

  req.store.numeracyScore = req.store.get('numeracy').totalScore;
  req.store.set('answers', data);
  next();
};

exports.getStudents = function(req, res, next) {

  var student = req.store.get('student');
  var teacher = req.store.get('teacher');

  numeracylib.getStudents({studentId : student._id, teacherId: teacher._id}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      req.store.numeracyScore = '';
      return next();
    } else {
      req.store.numeracyScore = parseInt(_.first(students).totalScore, 10);
    }
    next();
  });
};

exports.storeIndb = function(req, res, next) {

  var numeracy = req.store.numeracy;

  numeracy.answers = req.store.get('answers');
  // numeracy.score = req.store.get('score');
  numeracy.teacherId = req.store.get('teacher')._id;
  numeracy.schoolId = req.store.get('teacher').schoolId;
  numeracy.studentId = req.store.get('student')._id;
  numeracy.created = new Date().getTime();
  numeracy.createdIso = new Date().toISOString();
  numeracy.updated = new Date().getTime();
  numeracy.updatedIso = new Date().toISOString();

  if(numeracy.parentPresent === 'false') {
    numeracy.parentPresent = false;
  } else {
    numeracy.parentPresent = true;
  }

  numeracy.score = +numeracy.totalScore;

  numeracylib.create(numeracy, function(err, numeracy) {
    if (err) {
      return next(err);
    }
    res.response = numeracy.shift();
    next();
  });
};

exports.getNumeracy = function(req, res, next) {

  var studentIds = req.store.studentIds;
  var studentsArr = req.store.students;

  numeracylib.getStudents({studentId : {$in: studentIds}}, function(err, students) {
    if (err) {
      return next(err);
    }

    for (var i = 0; i < studentsArr.length; i++) {
      for (var j = 0; j < students.length; j++) {
        if(studentsArr[i]._id.toString() === students[j].studentId.toString()) {
          /*studentsArr[i].numeracy = {
            score: students[j].score,
            created: students[j].created
          };*/
          studentsArr[i].numeracy = students[j];
          break;
        }
      }
    }

    req.store.set('students', studentsArr);
    next();
  });
};

exports.getNumeracyData = function (req, res, next) {

  var student = req.store.student;
  var numeracyObj = {};

  numeracylib.getStudents({studentId: student._id}, function(err, numeracy) {
    if (err) {
      return next(err);
    }

    if(numeracy.length) {
      numeracy = _.first(numeracy);

      numeracyObj = {
        answers : _.pluck(numeracy.answers, 'answers'),
        nameEachNumber:numeracy.nameEachNumber,
        parentPresent: numeracy.parentPresent
      };
    }

    req.store.set('numeracy', numeracyObj);
    next();
  });
};

exports.deleteNumeracy = function(req, res, next) {

  var student = req.store.get('student');

  numeracylib.updateNumeracy({studentId: student._id}, {enabled: false}, function(err) {
    if (err) {
      return next(err);
    }

    next();
  });
};

exports.getAllNumeracy = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    numeracylib.getAllRecord(condition, function(err,numeracy) {
        if (err) {
          return next(err);
        }
        req.store.set('numeracy', numeracy);
        next();
    });
}

exports.getAllNumeracyCount = function(req, res, next){
   var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    numeracylib.NumeracyCount(condition,function(err,numeracy_count) {
        if (err) {
            return next(err);
        }
        req.store.set('numeracy_count', numeracy_count);
        next();
    });
};

// Function to assesment question 1
// score : 6a = 3
// <10 red, 10-19 yellow, 20+ green
//1, 2, 3
function numeracy1(answers, correct, values) {

  var combination = 0;
  var combinationArr = [];

  if(parseInt(answers[0], 10) === correct[0]) {
    combination = values[0];
  }

  if(parseInt(answers[0], 10) === correct[1]) {
    combination = values[1];
  }

  if(parseInt(answers[0], 10) === correct[2]) {
    combination = values[2];
  }

  combinationArr.push(combination.toString());

  answersObj = {
    answers  : answers,
    combination : combinationArr
  };

  return answersObj;
}

function ansBinary(answers, correct) {

  var combination = 0;
  var combinationArr = [];

  if(parseInt(answers[0], 10) === correct[0]) {
    combination = correct[0];
  }

  if(parseInt(answers[0], 10) === correct[1]) {
    combination = correct[1];
  }

  combinationArr.push(combination.toString());

  answersObj = {
    answers  : answers,
    combination : combinationArr
  };

  return answersObj;
}

// Function to assesment question 7a
// score : 7a = 3
// 0 red, 1-4 yellow, 5 green

// Function to assesment question 8a
// score : 8a = 2
// 0 red, 1-2 yellow, 3-4 green

// Function to assesment question 14a
// score : 14a = 2
// 0 red, 1-4 yellow, 5+ green

// Function to assesment question 15a
// score : 15a = 3
// 0 red, 1-5 yellow, 6-10 green
function numeracy2(answers, correct, lights) {

  var combination = 0;
  var combinationArr = [];

  if(parseInt(answers[0], 10) >= correct[1]) {
    combination = lights.GREEN;
  }

  if(parseInt(answers[0], 10) > correct[0] && parseInt(answers[0], 10) < correct[1]) {
    combination = lights.YELLOW;
  }

  if(parseInt(answers[0], 10) === correct[0]) {
    combination = lights.RED;
  }

  combinationArr.push(combination.toString());

  answersObj = {
    answers  : answers,
    combination : combinationArr
  };

  return answersObj;
}

// Function to assesment question 8a
// score : 9a + 10a = 1 (4, 5, 6)
// 0 red, 1-2 yellow, 3 green

// Function to assesment question 11a + 12a +13a
// score : 11a + 12a +13a = 2 (7, 8, 9)
// 0 red, 1-2 yellow, 3 green

function numeracy3(answers, correct, lights) {
  var combination = 0;
  var combinationArr = [];

  var count = _.countBy(answers, function(cnt) {
    return cnt;
  });

  if(count[lights.GREEN.toString()] === correct[1]) {
    combination = lights.GREEN;
  }

  if(!count[lights.GREEN.toString()]) {
    combination = lights.RED;
  }

  if(count[lights.GREEN.toString()] > correct[0] && count[lights.GREEN.toString()] < correct[1]) {
    combination = lights.YELLOW;
  }

  combinationArr.push(combination.toString());

  answersObj = {
    answers  : answers,
    combination : combinationArr
  };

  return answersObj;
}

function numeracy4(answers, correct, lights) {

  var combination = 0;
  var combinationArr = [];

  if(parseInt(answers[0], 10) === correct[3]) {
    combination = lights.GREEN;
  }

  if(parseInt(answers[0], 10) === correct[1] || parseInt(answers[0], 10) === correct[2]) {
    combination = lights.YELLOW;
  }

  if(answers[0] === correct[0]) {
    combination = lights.RED;
  }
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