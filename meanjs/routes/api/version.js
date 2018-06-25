'use strict';

var BadRequest = require('../../errors/errors').BadRequest;
var errMsg = require('../../errors/errorCodes');
var useragent = require('useragent');
var config = require('../../config/config');


exports.isOldApp = function(req, res, next) {
  var buildVersion = parseInt(getBuildVersion(req), 10);

  /*if(buildVersion < config.buildVersion) {
    return next(new BadRequest(errMsg['1023'], 1023));
  }*/

  next();
};


function getBuildVersion (req) {
  var agent = useragent.parse(req.headers['user-agent']);
  var source = agent ? agent.source : '';
  source = source.split(' ');
  source = source[0].split('/');
  return source[1];
}