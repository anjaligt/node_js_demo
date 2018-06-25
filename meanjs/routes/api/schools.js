'use strict';
var schoolslib  = require('../../lib/db/schools');
var teacherslib = require('../../lib/db/teachers');
var districtslib = require('../../lib/db/districts');
var utils       = require('../../lib/utils');
var BadRequest  = require('../../errors/errors').BadRequest;
var errMsg      = require('../../errors/errorCodes');
var _           = require('underscore');
var formidable  = require('formidable');
var async       = require('async');
exports.getSchools = function(req, res, next) {
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 

    schoolslib.getSchools(condition, function(err, schools) {
        if (err) {
            return next(err);
        }
        req.store.set('schools', schools);
        res.response = schools;
        next();
    });
};

exports.getSchoolsbyMultipleId = function(req, res, next) {
    var query = {};
    if (typeof req.body.sid !== 'undefined') {
        var schoolIdArr = [];
        req.body.sid.forEach(function(result) {
            schoolIdArr.push(utils.toObjectId(result));
        })
        query = {
            _id: {
                $in: schoolIdArr
            },
            enabled: true,
            active: true
        };

    } else {
        query = {
            enabled: true,
            active: true
        };
    }


    schoolslib.getSchools(query, function(err, schools) {
        if (err) {
            return next(err);
        }
        req.store.set('schools', schools);
        next();
    });
};

exports.getCompleteSchoolList = function(req, res, next) {
    var query = req.store.get('query');
    var schoolQuery = {};
    var searchQuery = '';
    if (!_.isUndefined(query)) {
        schoolQuery = {
            'name': new RegExp(query.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1'), 'i')
        };
        //schoolQuery2 = {'name':query.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")};
        searchQuery = query;
    }
    schoolslib.getSchools(schoolQuery, function(err, schools) {
        if (err) {
            return next(err);
        }
        var districts = req.store.get('districts');
        var counties = req.store.get('counties');
        for (var i = 0; i < schools.length; i++) {
            schools[i].districtName = '';
            for (var j = 0; j < districts.length; j++) {
                if (schools[i].distId.toString() === districts[j]._id.toString()) {
                    schools[i].districtName = districts[j].name;
                    schools[i].countyId = districts[j].countyId;
                    for (var k = 0; k < counties.length; k++) {
                        if (schools[i].countyId.toString() === counties[k]._id.toString()) {
                            schools[i].countyName = counties[k].name;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        req.store.set('searchQuery', searchQuery);
        req.store.set('schools', schools);
        next();
    });
};
exports.getSchoolId = function(req, res, next) {
    var schoolId = utils.toObjectId(req.params.id);
    schoolslib.getSchools({
        _id: schoolId
    }, function(err, getSchool) {
        if (err) {
            return next(err);
        }
        if (!getSchool.length) {
            return next(new BadRequest(errMsg['1000'], 1000));
        }
        req.store.set('school', getSchool.shift());
        next();
    });
};
exports.attachSchoolId = function(req, res, next) {
    var schoolId = utils.toObjectId(req.params.id);
    req.store.set('schoolId', schoolId);
    next();
};
exports.isValidObjectId = function(req, res, next) {
    var id = req.params.id;
    var sid = req.params.sid;
    if (id && !utils.isValidObjectID(id)) {
        return next(new BadRequest(errMsg['1017'], 1017));
    }
    if (sid && !utils.isValidObjectID(sid)) {
        return next(new BadRequest(errMsg['1018'], 1018));
    }
    next();
};
exports.isSchoolIsInDistrict = function(req, res, next) {
    var districtId = utils.toObjectId(req.params.id);
    var schoolId = utils.toObjectId(req.params.sid);
    schoolslib.getSchools({
        _id: schoolId,
        distId: districtId
    }, function(err, schools) {
        if (err) {
            return next(err);
        }
        if (!schools) {
            return next(new BadRequest(errMsg['1014'], 1014));
        }
        next();
    });
};
exports.getSchoolsFromMulitpleDistricts = function(req, res, next) {
    var districts = req.store.get('districts');
    var schools = req.store.get('schools');
    var finalSchoolList = [];
    var cnt = 0;
    for (var i = 0; i < districts.length; i++) {
        for (var j = 0; j < schools.length; j++) {
            if (schools[j].distId.toString() === districts[i]._id.toString()) { //this school is in the district, so add this in the schools array
                finalSchoolList[cnt] = schools[j];
                cnt = cnt + 1;
            }
        }
    }
    req.store.set('schools', finalSchoolList);
    next();
};
exports.getSchoolsFromDistricts = function(req, res, next) {
    //console.log(req);
    var districtId = utils.toObjectId(req.params.id);
    var query;
    if (req.params.sid) {
        var schoolId = utils.toObjectId(req.params.sid);
        query = {
            distId: districtId,
            _id: schoolId,
            active: true,
            enabled: true
        };
    } else {
        query = {
            distId: districtId,
            active: true,
            enabled: true
        };
    }
    schoolslib.getSchoolsData(query, {
        _id: true,
        name: true,
        distId:true
    }, function(err, schools) {
        if (err) {
            return next(err);
        }
        //console.log(schools);
        req.store.set('schools', schools);
        next();
    });
};
exports.getSchoolsFromDistrictsRes = function(req, res, next) {
    res.response = req.store.get('schools');
    next();
};
exports.getSchoolIds = function(req, res, next) {
    var schoolsArr = req.store.schools;
    var schoolIds = schoolsArr.map(function(school) {
        return school._id;
    });
    req.store.set('schoolIds', schoolIds);
    next();
};
/**
 * Extract params from a multipart request
 */
exports.extractParamsForPost = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var schoolParameters = {};
    form.parse(req, function(err, fields) {
        if (err) {
            //debug('error parsing multipart request ',  err);
            req.flash('error', 'Bad Request');
            return res.render('/schools');
        } else {
            // var keys = Object.keys(fields);
            schoolParameters.schoolName = fields.schoolName;
            schoolParameters.distId = fields.e2;
        }
        req.store.set('schoolParameters', schoolParameters);
        next();
    });
};
exports.create = function(req, res, next) {
    var data = req.body;
    var school = {};
    school.name = data.schoolName;
    school.distId = utils.toObjectId(data.e2);
    school.created = new Date().getTime();
    school.createdIso = new Date().toISOString();
    school.updated = new Date().getTime();
    school.updatedIso = new Date().toISOString();
    school.active = true;
    school.enabled = true;
    school.noOfTeachers = 0;
    var name = data.schoolName;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
     schoolslib.checkSchoolExist({name:regex,active:true, enabled: true}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{

           if(data.length){
                res.json({success:false,data:[],message:'School name already exist.'}); 
           }else{
             schoolslib.create(school, function(err) {
                    if (err) {
                        res.json({success:false,data:[],message:err});
                    }else{
                       res.json({success:true,data:[],message:'School Successfully added.'}); 
                    }
                });
           }
           
        }
    });
};

// custom made with some changes added by vivek starts
exports.createnew = function(req, res, next) {
    var school = {};
    school.name     = req.body.schoolName;
    school.distId   = utils.toObjectId(req.body.e2);
    school          = _.omit(school, 'schoolName');
    school.created  = new Date().getTime();
    school.createdIso   = new Date().toISOString();
    school.updated      = new Date().getTime();
    school.updatedIso   = new Date().toISOString();
    school.active   = true;
    school.enabled  = true;
    school.noOfTeachers = 0;
    schoolslib.create(school, function(err) {
        if (err) {
            return next(err);
        }
        next();
    });
};
// custom made with some changes added by vivek ends


exports.extractParamsForEditPost = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var schoolParameters = {};
    form.parse(req, function(err, fields) {
        if (err) {
            //debug('error parsing multipart request ',  err);
            req.flash('error', 'Bad Request');
            return res.render('/schools');
        } else {
            // var keys = Object.keys(fields);
            schoolParameters.schoolName = fields.editSchoolName;
            schoolParameters._id = fields.editSchoolId;
            //console.log(fields);
        }
        req.store.set('schoolParameters', schoolParameters);
        next();
    });
};
exports.update = function(req, res, next) {
    var data = req.body;
    var schoolId = utils.toObjectId(data.id);
    var school  = {};
    school.name = data.schoolName;
    school.updated = new Date().getTime();
    school.updatedISO = new Date().toISOString();
     var name = data.schoolName;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
     schoolslib.checkSchoolExist({name:regex,_id:{$ne:schoolId},active:true, enabled: true}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
               
           if(data.length){
                res.json({success:false,data:[],message:'School name already exist.'}); 
           }else{
             schoolslib.updateSchool({
                _id: utils.toObjectId(schoolId)
                }, {
                    $set: school
                }, function(err) {
                    if (err) {
                        res.json({success:false,data:[],message:err});
                    }else{
                        res.json({success:true,data:[],message:'School successfully updated.'}); 
                    }
                    
                });
           }
           
        }
    });
};

exports.total_schools_count = function(req, res,next){
    var data = req.body;
    var condition = {active : true,enabled : true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    schoolslib.SchoolsCount(condition,function(err,schools_count) {
        if (err) {
         return next(err);
        }else{
            schools_count = (schools_count) ? schools_count : 0;
            req.store.set('schools_count', schools_count);
            next();
        }
        
    });
};

exports.deleteSchool = function(req, res, next) {console.log("test");
    var schoolId = req.params.id;
    var options  = {active:false, enabled: false};
    schoolslib.deleteSchool({_id: utils.toObjectId(schoolId)},options,function(err, numRemoved){
        if (err) {
            res.json({success:false,data:[],message:err});
        } else {
             res.json({success:true,data:[],message:'School successfully deleted.'});
        }
    });
};

exports.schools_countby_DistrictId = function(req, res, next) {
    var DID = utils.toObjectId(req.params.id);
    schoolslib.SchoolsCount({distId:DID, active:true, enabled: true},function(err,schools_count) {
        if (err) {
            return next(err);
        }
        req.store.set('schools_count', schools_count);
        req.store.schools_count = schools_count;
        next();
    });

};
exports.search_school_by_name = function(req, res, next) {
    var Sname   = req.params.query;
    if(req.params.id){
        var SID     = utils.toObjectId(req.params.id);
        var query1 = {"name": new RegExp(Sname, 'i'),'_id': {$ne :SID},active: true, enabled: true};
    }else{
        var query1 = {"name": new RegExp(Sname, 'i'),active: true, enabled: true};
    }
    async.series({
        schools: function(cb) {
            schoolslib.getSchools(query1, function(err, schools) {
                if (err) {
                    return next(err);
                }
                schools = schools;
                cb(null, schools);
            });
        },
    }, function(err, results) {
        res.status(200).json({
            results: results
        });
    });
};

exports.getSchoolesByDistrictId = function(req, res, next){
   var resultArr = {}; 
   async.waterfall([
          function(callback){
           var districtId = utils.toObjectId(req.params.id);
            var query = {
                    distId: districtId,
                    active: true,
                    enabled: true
                };
             schoolslib.getSchoolsData(query, {}, function(err, schooles) {
                if (err) {
                    callback(err)
                }else{
                    callback(null, schooles);
                }
                
            });
           
          },
          function(schooles, callback){
             var DID = utils.toObjectId(req.params.id);
                schoolslib.SchoolsCount({distId:DID, active:true, enabled: true},function(err,schools_count) {
                    if (err) {
                        callback(err)
                    }else{
                        callback(null, schooles, schools_count);
                    }
                   
                });
          },
          function(schooles,schools_count, callback){
             var query = {
                     active:true, enabled: true
                };
                districtslib.getDistricts(query, function(err, districts) 
                {
                    if (err) {
                         callback(err);
                    }else{
                        resultArr.schooles = schooles;
                        resultArr.schools_count = schools_count;
                        resultArr.districts = districts;
                        callback(null, schooles, schools_count,districts);
                    }
                    
                });
          }
        ], function (err, result) {
            if(err){
               res.json({success:false,data:[],message:err});
            }else{
               res.json({success:true,data:resultArr,message:'schooles list.'});
            }
    });
};

exports.changeBillingStatus = function(req, res, next) {
    var data = req.body;
    var schoolId = utils.toObjectId(data.id);
    var school  = {};
    if(data.isType==='billed'){
         school.isBilled = data.value;
    }else if(data.isType==='payed'){
         school.isPayed = data.value;
    }else if(data.isType==='amount'){
          school.amount = data.value;
    }else if(data.isType==='note'){
          school.note = data.value;
    }
   
    school.updated = new Date().getTime();
    school.updatedISO = new Date().toISOString();
         schoolslib.updateSchool({
            _id: utils.toObjectId(schoolId)
            }, {
                $set: school
            }, function(err) {
                if (err) {
                    res.json({success:false,data:[],message:err});
                }else{
                    res.json({success:true,data:[],message:'School successfully updated.'}); 
                }
                
            });                     
        
};

exports.updateSchoolAmount = function(req, res, next) {
    var data = req.body;
    var schoolId = utils.toObjectId(data.id);
    var amount = data.amount;
    var year = data.year;
    var from_date = data.from_date;
    var to_date = data.to_date;
    var school  = {};
    school.amount = data.amount;
   
     school.updated = new Date().getTime();
     school.updatedISO = new Date().toISOString();
     schoolslib.getSchoolByAttr({enabled:true,active:true,_id:utils.toObjectId(schoolId)},{},function(err,data){
         if(err){
           res.json({success:false,data:[],message:err});
         }else if(data){
                 if(data.billing){
                     
                      if(data.billing.length){
                        var schoolArr =[];
                  
                            data.billing.forEach(function(result,key){
                              schoolArr.push(result); 
                              
                              if(result.year==year){
                                  schoolArr[key].year=year;
                                  schoolArr[key].amount=amount;
                                  schoolArr[key].from_date=from_date;
                                  schoolArr[key].to_date=to_date;
                              }else{
                                 var checkYearExist = data.billing.filter(function(obj){
                                    return obj.year==year;
                                 });
                                 if(!checkYearExist.length){
                                    schoolArr.push({year:year,amount:amount,from_date:from_date,to_date:to_date}); 
                                 } 
                              }
                            });

                            school.billing= schoolArr;
                           schoolslib.updateSchool({
                                _id: utils.toObjectId(schoolId)
                                }, {
                                    $set: school
                                }, function(err) {
                                    if (err) {
                                        res.json({success:false,data:[],message:err});
                                    }else{
                                        res.json({success:true,data:[],message:'School successfully updated.'}); 
                                    }
                                    
                                });   
                      }else{ 
                          school.billing=[{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                           schoolslib.updateSchool({
                                _id: utils.toObjectId(schoolId)
                                }, {
                                    $set: school
                                }, function(err) {
                                    if (err) {
                                        res.json({success:false,data:[],message:err});
                                    }else{
                                        res.json({success:true,data:[],message:'School successfully updated.'}); 
                                    }
                                    
                                });  
                      }
                       
                 }else{

                      school.billing = [{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                                          
                      schoolslib.updateSchool({
                                _id: utils.toObjectId(schoolId)
                                }, {
                                    $set: school
                                }, function(err) {
                                    if (err) {
                                        res.json({success:false,data:[],message:err});
                                    }else{
                                        res.json({success:true,data:[],message:'School successfully updated.'}); 
                                    }
                                    
                                });   
        
                 }
              
         }else{
            res.json({success:false,data:[],message:err});
         }
     });
                         
};



exports.SchoolByMultipleDistricts = function(req, res, next) {
    if (typeof req.body.did !== 'undefined') {
        var distIdArr = [];
         req.body.did.forEach(function(result){
            distIdArr.push(utils.toObjectId(result));        
        })
        var query = {
            distId: {
                $in: distIdArr
            },
            enabled: true,
            active: true
        };

    } else {
        var query = {
            enabled: true,
            active: true
        };
    }
   
    if(req.body.from_date && req.body.to_date){
        query.createdIso = {$gte:req.body.from_date, $lte:req.body.to_date};
    } 
    schoolslib.getSchools({}, function(err, schools) {
        if (err) {
            return next(err);
        }
        req.store.set('schools', schools);
        next();
    });
};

// find students with these ids
// we will get a array of students.
// Insert schools name matching that ids
// find  the teachers names
// find the scores