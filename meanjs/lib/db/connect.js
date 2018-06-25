'use strict';

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

var db;
/* jshint -W106 */
var access = new Server('localhost', 27017, { auto_reconnect: true }, { native_parser: true });

var mongoClient = new MongoClient(access);

exports = module.exports = getDb;

function getDb(done) {
  if (db) {
    return done(null, db);
  }
  mongoClient.open(function(err, mongoClient) {
    if (err) {
      return done(err);
    }
    db = mongoClient.db('firstfive_admin');
    done(null, db);
  });
}

// firstfive_admin