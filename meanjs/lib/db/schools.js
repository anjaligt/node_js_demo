'use strict';
var getDb = require('./connect');
exports.getSchools = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').find(data, {
            sort: {
                name: 1
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
exports.getSchoolsData = function(data, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').find(data, options, function(err, results) {
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

exports.getSchoolByAttr = function(data,option, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').findOne(data, option, function(err, result) { 
            if (err) {
                return done(err);
            }else{
                  done(null, result);
            }
             
        });
            
    });
};
exports.deleteSchool = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').update(query, options, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
        // db.collection('schools').remove(query, function(err, results) {
        //     if (err) {
        //         return done(err);
        //     }
        //     done(null, results);
        // });
    });
};
exports.create = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').insert(data, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};
exports.updateSchool = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').update(query, options, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};

exports.getSchoolsUniqueData = function(data,  done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').find(data, function(err, results) {
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

exports.SchoolsCount = function(query, done) {
    getDb(function(err, db) {
        if (err) {
          return done(err);
        }
    db.collection('schools').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }

        done(null, results);
    });
  });
};

exports.checkSchoolExist = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('schools').find(data, function(err, results) {
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