'use strict';
var crypto = require('crypto');
// var config = require('../config/config');
var _ = require('underscore');

var codes = [];

codes = codes.concat(_.range(65, 91), _.range(97, 123));

var numbersRange = _.range(1, 11);

// codes = codes.concat(_.range(0, 5));

exports.getPercentage = function  (array) {
  array.forEach(function(data) {
    var total = data.green + data.red + data.yellow;
    var max;

    data.green = roundedPercent(data.green / total);
    data.red = roundedPercent(data.red / total);
    data.yellow = roundedPercent(data.yellow / total);
    total = data.green + data.red + data.yellow;

    // If total exceeding 100, the maximum percentage goes down by 1
    // to round it off to 100. Or the other way around
    max = Math.max(data.green, data.red, data.yellow);
    if (total > 100) {
      if (max === data.green) {
        data.green -= 1;
      } else if (max === data.red) {
        data.red -= 1;
      } else if (max === data.yellow) {
        data.yellow -= 1;
      }
    } else if (total < 100) {
      if (max === data.green) {
        data.green += 1;
      } else if (max === data.red) {
        data.red += 1;
      } else if (max === data.yellow) {
        data.yellow += 1;
      }
    }

  });

  return array;

  function roundedPercent(val) {
    return Math.round(parseFloat(val.toFixed(2)) * 100);
  }
};

exports.averageCount = function(scores, len) {
  var total = 0;

  scores.forEach(function(score){
    total += parseInt(score, 10);
  });
  var rerult = Math.round(total/len);
  return rerult;
};

exports.findTotalLighs = function(i, results, ans, eachObj) {
  if(ans !== undefined) {
    switch (ans) {
      case 'green':
        if(results.length && results[i] !== undefined) {
          results[i].green += 1;
        } else {
          eachObj.green += 1;
          results.push(eachObj);
        }
        break;
      case 'red':
        if(results.length && results[i] !== undefined) {
          results[i].red += 1;
        } else {
          eachObj.red += 1;
          results.push(eachObj);
        }
        break;
      case 'yellow':
        if(results.length && results[i] !== undefined) {
          results[i].yellow += 1;
        } else {
          eachObj.yellow += 1;
          results.push(eachObj);
        }
        break;
    }
  }
  return results;
};

exports.isEmailValid = function(str) {
  var emailReg = /\S+@\S+\.\S+/i;
  return emailReg.test(str);
};


exports.generateToken = function (username, password) {
  var shasum = crypto.createHash('sha1');
  shasum.update(username + password + 'admin login', 'utf8');
  return shasum.digest('hex');
};

exports.lettersAnswers = function (letters, type) {

  var answers = [];
  var mailArr = codes;
  var i;
  var compareData;

  if (type === 'lettersound') {
    var range = [];
    for(i = 0; i < codes.indexOf('a'.charCodeAt()); ++i) {
      range.push(String.fromCharCode(codes[i]) + String.fromCharCode(codes[i] + 32));
    }
    mailArr = range;
  }

  if(!letters) {
    for(i = 0; i < mailArr.length; ++i) {
      answers[i] = 'not collected';
    }
  } else {
    for(i = 0; i < mailArr.length; ++i) {
      if (type === 'lettersound') {
        compareData = mailArr[i];
      } else {
        compareData = String.fromCharCode(mailArr[i]);
      }

      if (!!~letters.indexOf(compareData)) {
        answers[i] = 'yes';
      } else {
        answers[i] = 'no';
      }
    }
  }

  return answers;
};

exports.numberAnswers = function(numbers) {
  // console.log(numbers);
  // console.log(numbersRange);
  var i;
  var answers = [];
  if(!numbers) {
    for(i = 0; i < numbersRange.length; ++i) {
      answers[i] = 'not collected';
    }
  } else {
    for(i = 0; i < numbersRange.length; ++i) {
      if (!!~numbers.indexOf(numbersRange[i].toString())) {
        answers[i] = 'yes';
      } else {
        answers[i] = 'no';
      }
    }
  }

  return answers;
};

exports.getYesNoAnswers = function (answersArray, type) {

  var compare;
  var logic;

  if(type === 'literacy') {
    compare = 0;
  } else if(type === 'numeracy') {
    compare = 1;
  } else if(type === 'social') {
    compare = 1;
  }

  answersArray.forEach(function (eachQuestion, i) {
    eachQuestion.forEach(function (answer, i) {

      if(type === 'numeracy') {
        logic = answer >= compare;
      } else {
        logic = answer > compare;
      }

      if(logic)  {
        answer = 'yes';
      } else {
        answer = 'no';
      }
      eachQuestion[i] = answer;
    });
    answersArray[i] = eachQuestion;
  });

  return answersArray;
};

function getColumns(type) {

  var columns = [];
  var prefix = 'L3';
  var i;

  if (type === 'lettersound') {
    prefix = 'L4';
    for(i = 0; i < codes.indexOf('a'.charCodeAt()); ++i) {
      columns.push(prefix + String.fromCharCode(codes[i]) + String.fromCharCode(codes[i] + 32));
    }
  } else {
    for(i = 0; i < codes.length; ++i) {
      columns.push(prefix + String.fromCharCode(codes[i]));
    }
  }
  return columns;
}

function getColumnsNumeracy () {

  var prefix = 'N';
  var columns = [];
  var numbersCols = [];
  var i;

  for(i = 0; i < numbersRange.length; ++i) {
    if(i === 2) {
      // Replace N3 from columns with 'L3-3', 'L3-1', 'L3-4'
      columns.push(prefix + numbersRange[i] + '-3', prefix + numbersRange[i] + '-1', prefix + numbersRange[i] + '-4');
    } else {
      columns.push(prefix + numbersRange[i]);
    }
  }

  for(i = 0; i < numbersRange.length; ++i) {
    numbersCols.push('N11-' + numbersRange[i]);
  }

  columns = columns.concat(numbersCols);
  return columns;
}

exports.getCSVHeader = function() {
  var csvHead = ['First name', 'Last name', 'Created', 'Gender', 'DOB', 'First Language', 'IEP', 'Preschool', 'Transitional Kindergarten', 'Teacher Name', 'Teacher Email', 'School Name', 'District Name','County Name'];
  var litHead1 = ['L1a', 'L1b', 'L1c', 'L2a', 'L2b'];
  var litHead2 = getColumns('letters');
  var litHead3 = getColumns('lettersound');
  var litHead4 = ['L5aLip/Sip', 'L5aBoy/Duck', 'L5aCan/Van', 'L5aMop', 'L5Mat', 'L5aBug'];

  var numeracyHead = getColumnsNumeracy();

  var socialHead = ['SEP1', 'SEP2', 'SEP3', 'SEP4', 'SEP5', 'SEP6'];

  csvHead = csvHead.concat(litHead1, litHead2, litHead3, litHead4, numeracyHead, socialHead);

  return csvHead;
};

// function arrayEmpty(arr) {
//   for(var i=0; i<arr.length; i++) {
//     if(arr[i] === '') return true;
//   }
//   return false;
// }