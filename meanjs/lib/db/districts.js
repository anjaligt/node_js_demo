 'use strict';
var getDb = require('./connect');
var pdf = require('html-pdf');
var fs = require('fs');
var path = require('path');

exports.getDistricts = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('districts').find(data,{
            sort: { name: 1 }
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
exports.getCounties = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('county').find(data,{
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

exports.getCountYByAttr = function(data,option, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('county').findOne(data, option, function(err, result) { 
            if (err) {
                return done(err);
            }else{
                  done(null, result);
            }
             
        });
            
    });
};

exports.getDistrictByAttr = function(data,option, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('districts').findOne(data, option, function(err, result) { 
            if (err) {
                return done(err);
            }else{
                  done(null, result);
            }
             
        });
            
    });
};

exports.checkCountyExist = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('county').find(data, function(err, results) {
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
exports.checkDistrictExist = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('districts').find(data, function(err, results) {
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
exports.createCounty = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('county').insert(data, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};

exports.updateCounty = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('county').update(query, options, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};
exports.createDistrict = function(data, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('districts').insert(data, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};

exports.CountiesCount = function(query, done) {
  getDb(function(err, db) {
    if (err) {
      return done(err);
    }
    db.collection('county').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }
        done(null, results);
    });
  });
};

exports.DistrictsCount = function(query, done) {
    getDb(function(err, db) {
        if (err) {
          return done(err);
        }
    db.collection('districts').count(query ,function(err, results) {
        if (err) {
            return done(err);
        }

        done(null, results);
    });
  });
};

exports.updateDistrict = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }
        db.collection('districts').update(query, options, function(err, results) {
            if (err) {
                return done(err);
            }
            done(null, results);
        });
    });
};

exports.updateCounty = function(query, options, done) {
    getDb(function(err, db) {
        if (err) {
            return done(err);
        }

        db.collection('county').update(query, options, function(err, results) {
            if (err) {

                return done(err);
            }else{
              done(null, results);
            }
        });
    });
};

exports.exportPdf = function(data, done){
   if(data.file_name){
     var fileName = data.file_name+'.pdf';
    }else{
     var fileName = Math.floor(Math.random() * 1000000000)+'.pdf';
    }
  var filePath = path.join(__dirname,'../../public/uploads/' + fileName);
  var options = {format: 'Letter'};
  
   fs.exists(filePath, function(exists) { 
        if (exists) {
            fs.unlinkSync(filePath);

            pdf.create(data.html, options).toFile(filePath, function(err, result) {
              if (err){
                 return done(err);
              }else{
                   done(null, {pdf:fileName});
              };
               
            });          
 
          }else{

              pdf.create(data.html, options).toFile(filePath, function(err, result) {
              if (err){
                  return done(err);
              }else{ 
                   done(null, {pdf:fileName});
              };
               
            }); 
          }
    });
};