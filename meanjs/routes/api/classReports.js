'use strict';

exports.processData = function(req, res, next) {

  var totalGreen = 0;
  var literacyScore = 0;
  var numeracyScore = 0;
  var socialScore = 0;

  if(req.store.literacyData) {
    literacyScore = req.store.literacyData.avgScore;
  }

  if(req.store.numeracyData) {
    numeracyScore = req.store.numeracyData.avgScore;
  }

  if(req.store.socialData) {
    socialScore = req.store.socialData.avgScore;
  }

  totalGreen = literacyScore + numeracyScore + socialScore;

  // if(req.store.get('greenLights')) {
  //   totalGreen = req.store.get('greenLights');
  // }

  // if(!totalGreen && req.store.literacyData && req.store.numeracyData && req.store.socialData) {
  //   totalGreen = 0;
  // }

  var resObj = {
    totalGreen: totalGreen,
    literacy: req.store.literacyData,
    numeracy: req.store.numeracyData,
    social: req.store.socialData
  };

  res.response = resObj;
  next();
};
