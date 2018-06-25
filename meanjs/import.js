//Note: to run this file
// county: node import.js county
// districts : node import.js district
// support: node import.js schools

var fs = require('fs');
var getDb = require('./lib/db/connect');
var async = require('async');

var _ = require('underscore');

var county = __dirname + '/static/json/county.json';
var districts = __dirname + '/static/json/districts.json';
var schools = __dirname + '/static/json/schools.json';

var now = new Date();

process.argv.forEach(function(val, index, array) {

  if(index === 2 && val === 'county') {

    getDb(function(err, db) {
      if (err) {
        return done(err);
      }
      fs.readFile(county, 'utf8', function (err, data) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }

        data = JSON.parse(data);

        data.forEach(function(d){
          d.active = true;
          d.enabled = true;
          d.created = now.getTime();
          d.createdISO = now.toISOString();
          d.updated = now.getTime();
          d.updatedISO = now.toISOString();
        });

        db.collection('county').insert(data, function(err, mapdata) {
          if (err) {
            return callback(err);
          }
          if(mapdata.length) {
            console.log('county done');
          }
        });

      });
    });
  } else if(index === 2 && val === 'district') {

    getDb(function(err, db) {
      if (err) {
        return done(err);
      }

      fs.readFile(districts, 'utf8', function (err, records) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }
        records = JSON.parse(records);
        var maprecords = [];
        maprecords = records.map(function(d) {
          return function(callback) {
            db.collection('county').find({name: d.county}, function(err, results) {
              if (err) {
                return callback(err);
              }

              results.toArray(function(err, items) {
                if (err) {
                  return done(err);
                }
                var dataObj = {
                  name : d.name,
                  countyId: _.first(items)._id,
                  active: true,
                  enabled: true,
                  created: now.getTime(),
                  createdISO: now.toISOString(),
                  updated: now.getTime(),
                  updatedISO: now.toISOString()
                };
                callback(null, dataObj);
              });
            });
          }
        });

        async.series(maprecords, cback);

        function cback(err, results) {
          if (err) {
            console.error(err);
          }
          db.collection('districts').insert(results, function(err, mapdata) {
            if (err) {
              return callback(err);
            }
            if(mapdata.length) {
              console.log('districts done');
            }
          });

        }
      });
    });
  } else if(index === 2 && val === 'schools') {

    getDb(function(err, db) {
      if (err) {
        return done(err);
      }

      fs.readFile(schools, 'utf8', function (err, records) {
        if (err) {
          console.log('Error: ' + err);
          return;
        }
        records = JSON.parse(records);
        var maprecords = [];
        maprecords = records.map(function(d) {
          return function(callback) {
            db.collection('districts').find({name: d.district}, function(err, results) {
              if (err) {
                return callback(err);
              }

              results.toArray(function(err, items) {
                if (err) {
                  return done(err);
                }
                var dataObj = {
                  name : d.name,
                  distId: _.first(items)._id,
                  active: true,
                  enabled: true,
                  created: now.getTime(),
                  createdISO: now.toISOString(),
                  updated: now.getTime(),
                  updatedISO: now.toISOString()
                };
                callback(null, dataObj);
              });
            });
          }
        });

        async.series(maprecords, cback);

        function cback(err, results) {
          if (err) {
            console.error(err);
          }
          db.collection('schools').insert(results, function(err, mapdata) {
            if (err) {
              return callback(err);
            }
            if(mapdata.length) {
              console.log('schools done');
            }
          });

        }
      });
    });
  }
});

