'use strict';

var getDb = require('./connect');

exports.create = function(data, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('social').insert(data, function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
    });
  });
};

exports.getStudents = function(data, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('social').find(data, function(err, results) {
      if (err) {
        return done(err);
      }
      results.toArray(function(err, items) {
        if (err) {
          return done(err);
        }
        done(null, items);
      });
    });
  });
};

exports.getStudentsByAttr = function(data,option, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('social').find(data,option, function(err, results) {
      if (err) {
        return done(err);
      }
      results.toArray(function(err, items) {
        if (err) {
          return done(err);
        }
        done(null, items);
      });
    });
  });
};

exports.updateSocial = function(query, options, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('social').update(query, {$set: options }, function(err, results) {
      if (err) {
        return done(err);
      }

      done(null, results);
    });
  });
};

exports.getCountByTeacherId = function(query,resindex, done){
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('social').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        var res = [];
        res['resindex']   = resindex;
        res['count']      = results;
        res['teacher_id'] = query.teacherId;
        done(null, res);
    });
  });

}

exports.getAllRecord = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }

        db.collection('social').find(data, function(err, results) {
            if (err) {
                return done(err);
            }
            results.toArray(function(err, items) {
                if (err) {
                    return done(err);
                }
                //console.log(items);
                done(null, items);
            });
        });
    });
};

exports.SocialCount = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('social').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        done(null, results);
    });
  });
};