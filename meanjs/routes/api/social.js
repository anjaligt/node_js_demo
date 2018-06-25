'use strict';
var utils = require('../../lib/utils');
var _ = require('underscore');
var config = require('../../config/config');
var AssessmentsSchema = require('../../lib/db/schema/assessment');
var sociallib = require('../../lib/db/social');
var common = require('../../lib/common');
var BadRequest = require('../../errors/errors').BadRequest;
var errMsg = require('../../errors/errorCodes');

var score = 0;
var color, answersObj;
var points;

exports.getAnswers = function(req, res, next) {
  var keys = ['answers', 'parentPresent', 'totalScore', 'createDate'];

  var answers = new AssessmentsSchema();

  _.extend(answers, _.pick(req.body, keys));
  utils.trim(answers);

  req.store.set('social', answers);

  next();
};

exports.findStudent = function(req, res, next) {
  var student = req.store.get('student');

  sociallib.getStudents({studentId : student._id}, function(err, students) {
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

  sociallib.getStudents({teacherId: teacher._id, enabled: true}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      return next();
    }

    var results = [];
    var socialAns = _.pluck(students, 'answers');

    var totalScores = _.pluck(students, 'totalScore');
    var average = common.averageCount(totalScores, students.length);

    socialAns.forEach(function(answers) {
      var flatAnswers = _.flatten(_.pluck(answers, 'answers'));
      var len = flatAnswers.length;
      for(var i = 0;  i < len; ++i) {
        var eachObj = { green : 0, red: 0, yellow: 0 };
        var ans = compareAnswer(i, flatAnswers[i]);
        results = common.findTotalLighs(i, results, ans, eachObj);
      }
    });

    var finalResult = findCombination(results);

    var socialObj = {
      socialData : common.getPercentage(finalResult),
      numberStudents : students.length,
      avgScore : average
    };

    req.store.socialData = socialObj;
    next();
  });
};

function compareAnswer(index, answer) {
  var correctAnswers = config.reportLogic.social[index];
  var range = correctAnswers.answer;

  // if(parseInt(answer, 10) === 0) {
  //   return 'red';
  // } else if (parseInt(answer, 10) > range[0] && parseInt(answer, 10) < range[1] ) {
  //   return 'yellow';
  // } else {
  //   return 'green';
  // }

  if(parseInt(answer, 10) === 0) {
    return 'red';
  } else if (parseInt(answer, 10) > range[0] ) {
    return 'green';
  } else {
    return 'yellow';
  }
}

function findCombination (mainArr) {

  var combinationArray = config.combinationArray.social;
  var index = 0;
  combinationArray.forEach(function(record) {
      var green = 0;
      var red = 0;
      var yellow = 0;
      var i = 0;

      for (i = 0; i < record; i++) {
        var ind = index+i;
        green +=  mainArr[ind].green;
        red += mainArr[ind].red;
        yellow += mainArr[ind].yellow;
      }
      index += i;
      var eachobj = {
        green: green,
        red: red,
        yellow: yellow
      };
      mainArr.splice(index, 0, eachobj);
      index += 1;
  });
  return mainArr;
}

exports.validateAssessment = function(req, res, next) {

  var social = req.store.get('social').answers;
  var questionsCount = 0;

  if(social.length !== config.tolatQuestions.social) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  social.forEach(function(each) {
    questionsCount = questionsCount + each.length;
  });

  if(questionsCount < config.tolatQuestions.social) {
    return next(new BadRequest(errMsg['1019'], 1019));
  }

  next();
};

exports.assessment = function(req, res, next) {
  var social = req.store.get('social').answers;
  // var correctAnswers = config.answers.social;
  var lights = config.lights;
  var result;
  var data = [];

  for(var i = 0, len = social.length; i < len; ++i) {

    if (i === 0) {
      points = 1;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 1 ' + errMsg['1016'], 1016));
      }
      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }

    if (i === 1) {
      points = 3;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 2 ' + errMsg['1016'], 1016));
      }

      // if(!validateSocial(social[i+1])) {
      //   score = 0;
      //   return next(new BadRequest('question 3 ' + errMsg['1016'], 1016));
      // }

      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }

    if (i === 2) {
      points = 3;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 2 ' + errMsg['1016'], 1016));
      }

      // if(!validateSocial(social[i+1])) {
      //   score = 0;
      //   return next(new BadRequest('question 3 ' + errMsg['1016'], 1016));
      // }

      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }

    if (i === 3) {
      points = 2;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 4 ' + errMsg['1016'], 1016));
      }
      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }

    if (i === 4) {
      points = 2;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 5 ' + errMsg['1016'], 1016));
      }
      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }

    if (i === 5) {
      points = 1;
      if(!validateSocial(social[i])) {
        score = 0;
        return next(new BadRequest('question 6 ' + errMsg['1016'], 1016));
      }
      result = getSocialScores(social[i], lights, points);
      data.push(result);
    }
  }

  req.store.set('answers', data);
  req.store.socialScore = req.store.get('social').totalScore;
  req.store.set('score', score);
  score = 0;
  next();
};

exports.storeIndb = function(req, res, next) {

  var social = req.store.social;

  social.answers = req.store.get('answers');
  // social.score = req.store.get('score');
  social.teacherId = req.store.get('teacher')._id;
  social.schoolId = req.store.get('teacher').schoolId;
  social.studentId = req.store.get('student')._id;
  social.created = new Date().getTime();
  social.createdIso = new Date().toISOString();
  social.updated = new Date().getTime();
  social.updatedIso = new Date().toISOString();

  if(social.parentPresent === 'false') {
    social.parentPresent = false;
  } else {
    social.parentPresent = true;
  }

  social.score = +social.totalScore;

  sociallib.create(social, function(err, social) {
    if (err) {
      return next(err);
    }
    res.response = social.shift();
    next();
  });
};

exports.getSocial = function(req, res, next) {

  var studentIds = req.store.studentIds;
  var studentsArr = req.store.students;

  sociallib.getStudents({studentId : {$in: studentIds}}, function(err, students) {
    if (err) {
      return next(err);
    }

    for (var i = 0; i < studentsArr.length; i++) {
      for (var j = 0; j < students.length; j++) {
        if(studentsArr[i]._id.toString() === students[j].studentId.toString()) {
          /*studentsArr[i].social = {
            score: students[j].score,
            created: students[j].created
          };*/
          studentsArr[i].social = students[j];
          break;
        }
      }
    }

    req.store.set('students', studentsArr);
    next();
  });
};

exports.getScialData = function (req, res, next) {

  var student = req.store.student;
  var socialObj = {};

  sociallib.getStudents({studentId: student._id}, function(err, social) {
    if (err) {
      return next(err);
    }

    if(social.length) {
      social = _.first(social);

      socialObj = {
        answers : _.pluck(social.answers, 'answers'),
        parentPresent: social.parentPresent
      };
    }

    req.store.set('social', socialObj);
    next();
  });
};


exports.deleteSocial = function(req, res, next) {

  var student = req.store.get('student');

  sociallib.updateSocial({studentId: student._id}, {enabled: false}, function(err) {

    if (err) {
      return next(err);
    }

    next();
  });
};


exports.getStudents = function(req, res, next) {

  var student = req.store.get('student');
  var teacher = req.store.get('teacher');

  sociallib.getStudents({studentId : student._id, teacherId: teacher._id}, function(err, students) {
    if (err) {
      return next(err);
    }

    if(!students.length) {
      req.store.socialScore = '';
      return next();
    } else {
      req.store.socialScore = parseInt(_.first(students).totalScore, 10);
    }
    next();
  });
};



function getSocialScores(ans, lights, points) {

  if(ans[0] === 0) {
    color = lights.RED;
  }

  if(ans[0] === 1) {
    color = lights.YELLOW;
  }

  if(ans[0] === 2 || ans[0] === 3) {
    score = score + points;
    color = lights.GREEN;
  }

  answersObj = {
    answers  : ans,
    color : color
  };

  return answersObj;
}

function validateSocial(arr) {
  var annInput = [0, 1, 2, 3];
  return _.contains(annInput, parseInt(arr[0], 10));
}


exports.getAllSocial = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    sociallib.getAllRecord(condition, function(err,social) {
        if (err) {
          return next(err);
        }
        req.store.set('social', social);
        next();
    });
}

exports.getAllSocialCount = function(req, res, next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    }
    sociallib.SocialCount(condition,function(err,social_count) {
        if (err) {
            return next(err);
        }
        req.store.set('social_count', social_count);
        next();
    });
};