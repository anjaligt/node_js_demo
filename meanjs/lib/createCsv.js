// 'use strict';
// var debug = require('debug')('ff:cron');
// var fs = require('fs');

// var students = require('./db/students');
// var literacy = require('./db/literacy');
// var numeracy = require('./db/literacy');
// var social = require('./db/social');

// var stringify = require('csv-stringify');


// function createCsv() {
//   var logPath = __dirname + '/../logs/smslog.csv';
//   students.getStudents({}, function(err, results) {
//     if(err) {
//       debug(err);
//     }
//     var insert = [];
//     var data = [];
//     var head = ['_id', 'firstName', 'lastName', 'gender', 'dob', 'active', 'enabled', 'created', 'updated', 'teacherId', 'schoolId'];

//     insert.push(head);
//     results.forEach(function(student) {
//       data.push(student._id.toString(), student.firstName, student.lastName, student.gender, student.dob, student.active, student.enabled, new Date(student.created).toGMTString(),  new Date(student.updated).toGMTString(), student.teacherId.toString(), student.schoolId.toString());
//       insert.push(data);
//     });
//     data = [];
//     csvgen(logPath, insert, function(err, result) {
//       if(err) {
//         debug(err);
//       }
//       if(result) {
//         students.deleteStudents({}, function(err, result) {
//           if(err) {
//             debug(err);
//           }
//           debug('students deleted');
//         });
//       }
//     });
//     literacy.getStudents({}, function(err, results) {
//       if(err) {
//         debug(err);
//       }
//       console.log(results);
//     });
//   });
// }


// exports = module.exports = createCsv;


// function csvgen(logPath, data, done) {
//   stringify(data, function(err, output){
//     if (err) {
//       debug(err);
//     }
//     fs.appendFileSync(logPath, output);
//     return done(null, true);
//   });
// }
