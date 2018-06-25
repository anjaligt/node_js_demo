'use strict';
var getDb = require('./connect');
var utils           = require('../../lib/utils');
exports.create = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').insert(data, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};
exports.findTeacher = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').find(query, function(err, results) {
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
exports.getTeachers = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').find(query, {
            sort: {
                firstName: 1
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
exports.updateTeacher = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').update(query, {
            $set: options
        }, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};
exports.disableTeachers = function(req, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }else{       
      var isAdminTeacher  =   req.admin_teacher;
      req.teachers.forEach(function(res){
        var condition = {$set: {enabled: false}};
           if(isAdminTeacher==2 || isAdminTeacher=='2'){ 
            condition = {$set: {enabled: false},$unset: {associated_teachers_id:1}};
           } 
       db.collection('teachers').update({_id:utils.toObjectId(res)}, condition, function(err, results) {
            if (err) {
                return done(err);
            }
           
        });
      });
         done(null, []);
     }
    });
};
exports.deleteTeacher = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').remove(query, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};


// modified search teacher starts

exports.searchTeacher = function(query, index, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').find(query, function(err, results) {
            if (err) {
                return done(err);
            }
            results.toArray(function(err, items) {
                if (err) {
                    return done(err);
                }
                //done(null, items.shift());
                var res = [];
                res['resindex']     = index;
                res['admin_email']  = items.shift();
                done(null, res);
            });
        }); 
    });
};
// // modified search teacher ends


// get total normal teacher count starts
exports.TeachersCount = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('teachers').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        done(null, results);
    });
  });
};

exports.getTeachersbytime = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').find(query, {
            sort: {
                created: -1
            }
        }, function(err, results) {
            if (err) {
                return done(err);
            }
            results.toArray(function(err, items) {
                if (err) {
                    return done(err);
                }
                if (items.length > 0) {
                    done(null, items);
                }
            });
        });
    });
};

exports.getAppSetting = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('appsettings').findOne(query, {}, function(err, results) {
            if (err) {
                return done(err);
            }else{
                  done(null, results);
               }
        });
    });
};

exports.getAppSettingByAttr = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('appsettings').findOne(query, {}, function(err, results) {
            if (err) {
                return done(err);
            }else{
                  done(null, results);
               }
        });
    });
};

exports.createSetting = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('appsettings').insert(data, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};

exports.updateSettings = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('appsettings').update(query, {
            $set: options
        }, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};
exports.getTeacherByAttr = function(query, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('teachers').findOne(query, function(err, result) {
            if (err) {
                return done(err);
            }
                 if (err) {
                    return done(err);
                }else{
                  done(null, result);
               }
            });
        
    });
};
// get total normal teacher count starts