'use strict';

exports.render = function (req, res) {
  var districts = req.store.counties;
  res.render('reports', {
    reports: true,
    data: districts
  });
};