'use strict';

var _ = require('underscore');
var ObjectId = require('mongodb').ObjectID;


exports.trim = function(object) {
  if (_.isString(object)) {
    object = object.trim();
  }

  if (_.isObject(object) || _.isArray(object)) {
    // Only trimming first level string values
    _.each(object, function(value, key) {
      if (_.isString(value)) {
        object[key] = value.trim();
      }
    });
  }

  return object;
};

exports.noWhitespace = function(str, replace) {
  replace = replace === undefined ? '' : replace;
  return str.replace(/\s/g, replace);
};

exports.toObjectId = function(id) {
  if (!id) {
    throw new Error('Expecting id');
  }

  if ('string' === typeof id) {
    return ObjectId.createFromHexString(id);
  }

  return id;
};

exports.isValidDate = function (value, userFormat) {

  userFormat = userFormat || 'mm/dd/yyyy'; // default format

  var delimiter = /[^mdy]/.exec(userFormat)[0];
  var theFormat = userFormat.split(delimiter);
  var theDate = value.split(delimiter);
  var isDate;

  isDate = function (date, format) {
    var m, d, y;
    for (var i = 0, len = format.length; i < len; i++) {
      if (/m/.test(format[i])) {
        m = date[i];
      }
      if (/d/.test(format[i])) {
        d = date[i];
      }
      if (/y/.test(format[i])){
        y = date[i];
      }
    }
    return (
      m > 0 && m < 13 &&
      y && y.length === 4 &&
      d > 0 && d <= (new Date(y, m, 0)).getDate()
    );
  };

  return isDate(theDate, theFormat);
};

exports.isGrnderValid = function(string) {

  var genderArr = ['m', 'f', 'male', 'female'];

  if(_.contains(genderArr, string)) {
    return true;
  }
  return false;
};

exports.genderStr = function(gender) {

  if((gender === 'f') || (gender === 'female')) {
    gender = 'female';
  }

  if((gender === 'm') || (gender === 'male')) {
    gender = 'male';
  }

  return gender;
};

exports.isValidObjectID = function(str) {

  if('string' !== typeof str) {
    str = str.toString();
  }

  return (/^[0-9a-fA-F]{24}$/).test(str);
};