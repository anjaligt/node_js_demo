'use strict';

var getDb = require('./connect');

exports.create = function(data, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('literacy').insert(data, function(err, results) {
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

    db.collection('literacy').find(data, function(err, results) {
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

    db.collection('literacy').find(data,option, function(err, results) {
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

exports.updateLiteracy = function(query, options, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('literacy').update(query, {$set: options }, function(err, results) {
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
    db.collection('literacy').count(query ,function(err, results) {
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



exports.total_literacy_count = function(query,done) {
 getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('literacy').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        done(null, results);
    });
  });
};

exports.getAllRecord = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }

        db.collection('literacy').find(data, function(err, results) {
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

exports.LiteracyCount = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('literacy').count(query ,function(err, literacy_count) {
        if (err) {
            return done(err);
        }
        done(null, literacy_count);
    });
  });
};