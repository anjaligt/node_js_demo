'use strict';

var getDb = require('./connect');

exports.create = function(data, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').insert(data, function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
    });
  });
};


exports.findStudent = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').find(query, function(err, results) {
      if (err) {
        return done(err);
      }
      results.toArray(function(err, items) {
        if (err) {
          return done(err);
        }

        done(null, items.shift());
      });
    });
  });
};

exports.findStudentByAttr = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').findOne(query, function(err, student) {
      if (err) {
        return done(err);
      }else{
         done(null, student);
      }
      
    });
  });
};

exports.findStudentDuplicate = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').find(query, function(err, results) {
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


exports.updateStudent = function(query, options, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').update(query, {$set: options }, function(err, results) {
      if (err) {
        return done(err);
      }

      done(null, results);
    });
  });
};

exports.updateMultipleStudents = function(query, options, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').update(query,  options,{multi:true} , function(err, results) {
      if (err) {
        return done(err);
      }

      done(null, results);
    });
  });
};

exports.getSortedStudent = function(query, options, sort, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').find(query, options).sort(sort, function(err, results) {
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

exports.getStudents = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').find(query, function(err, results) {
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


exports.getMatchingStudents = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').find(query,{
            sort: {
                lastName: 1
            }
        }, function(err, results) {
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


exports.deleteStudents = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').remove({}, function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
    });
  });
};


exports.getStudentLanguages = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }

    db.collection('students').distinct("firstLanguage", function(err, results) {
      if (err) {
        return done(err);
      }
      done(null, results);
      /*results.toArray(function(err, items) {
        if (err) {
          return done(err);
        }

        done(null, items);
      });*/
    });
  });
};


exports.StudentsCountByTeacherId = function(query,resindex, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('students').count(query ,function(err, results) {
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
};

exports.StudentsCount = function(query, done) {
    getDb(function(err, db) {
        if (err) {
          return done(err);
        }
    db.collection('students').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        done(null, results);
    });
  });
};