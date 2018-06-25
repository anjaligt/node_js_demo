'use strict';

exports.processData = function(req, res, next) {
  var literacy = req.store.literacy;
  var numeracy = req.store.numeracy;
  var social = req.store.social;

  var resObj = {
    literacy: literacy,
    numeracy: numeracy,
    social: social
  };

  res.response = resObj;
  next();
};