'use strict';
var districtslib    = require('../../lib/db/districts');
var utils           = require('../../lib/utils');
var schoolslib      = require('../../lib/db/schools');
var teacherslib     = require('../../lib/db/teachers');
var studentslib     = require('../../lib/db/students');
var async           = require('async');
var _               = require('underscore');
var debug           = require('debug')('ff:district');
var formidable      = require('formidable');

exports.getDistricts = function(req, res, next) 
{  
    var data = req.body;
    var condition = {enabled:true,active:true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    districtslib.getDistricts(condition, function(err, districts) 
    {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        req.store.districts = districts;
        next();
    });
};

exports.getDistrictsFromCounty = function(req, res, next) 
{
    var countyId;
    if (typeof req.params.id !== 'undefined') 
    {
        countyId = utils.toObjectId(req.params.id);
    } else {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = { countyId: countyId,enabled:true, active:true };
    districtslib.getDistricts(query, function(err, districts) 
    {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        next();
    });
};

exports.getDistrictsFromCountyRes = function(req, res, next) 
{
    res.response = req.store.get('districts');
    next();
};

exports.getCounties = function(req, res, next) 
{ 
    var data = req.body;
    var condition = {enabled:true,active:true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 

    districtslib.getCounties(condition, function(err, counties) 
    {
        if (err) {
            return next(err);
        }
        req.store.set('counties', counties);
        req.store.counties = counties;
        next();
    });
};

exports.getDistrictsByCountyId = function(req, res, next) 
{
   var resultArr = {}; 
   async.waterfall([
          function(callback){
             districtslib.getCounties({active:true, enabled: true}, function(err, counties) 
                {
                    if (err) {
                        callback(err);
                    }else{
                     callback(null, counties);
                    }
                    
                });
           
          },
          function(counties, callback){
             var CID = utils.toObjectId(req.params.id);
                districtslib.DistrictsCount({countyId:CID, active:true, enabled: true},function(err,districts_count) {
                    if (err) {
                         callback(err);
                    }else{
                        callback(null, counties, districts_count);
                    } 
                     
                });
          },
          function(counties,districts_count, callback){
             var query = {
                    countyId: utils.toObjectId(req.params.id),
                    active:true, enabled: true
                };
                districtslib.getDistricts(query, function(err, county_districts) 
                {
                    if (err) {
                         callback(err);
                    }else{
                        resultArr.counties = counties;
                        resultArr.districts_count = districts_count;
                        resultArr.county_districts = county_districts;
                        callback(null, counties, districts_count,county_districts);
                    }
                    
                });
          }
        ], function (err, result) {
            if(err){
               res.json({success:false,data:[],message:err});
            }else{
               res.json({success:true,data:resultArr,message:'County districts.'});
            }
    });

   
};

exports.getDistrictFromId = function(req, res, next) 
{
    var distId = req.params.id;
    districtslib.getDistricts({
        _id: utils.toObjectId(distId),enabled: true, active:true
    }, function(err, district) {
        if (err) {
            return next(err);
        }
        req.store.district = district;
        next();
    });
};

exports.deleteDistrict = function(req, res, next){
    var district = {};
    var district_id     = utils.toObjectId(req.params.id);
    district.enabled    = false;
    district.active     = false;
    district.updated    = new Date().getTime();
    district.updatedISO = new Date().toISOString();
    districtslib.updateDistrict({ _id:district_id},{$set: district},function(err) {
        if (err) {
            return next(err);
        }
        next();
    });


}

exports.deleteCounty = function(req, res, next){
    var county = {};
    var county_id     = utils.toObjectId(req.params.id);
    county.enabled    = false;
    county.active     = false;
    county.updated    = new Date().getTime();
    county.updatedISO = new Date().toISOString();
    districtslib.updateCounty({ _id:county_id},{$set: county},function(err) {
        if (err) {
            return next(err);
        }
        next();
    });


}


exports.getCountyFromId = function(req, res, next) 
{
    var countyId = req.params.cid;
    districtslib.getCounties({
        _id: utils.toObjectId(countyId),enabled: true, active:true
    }, function(err, county) {
        if (err) {
            return next(err);
        }
        req.store.county = county;
        next();
    });
};

exports.getSchoolsAndDistricts = function(req, res, next) {
    var students = req.store.studentsInfo;
    async.map(students, findSchoolsAndDist, function(err, students) 
    {
        if (err) {
            debug(err);
        }
        req.store.allData = students;
        next();
    });

    function findSchoolsAndDist(student, done) 
    {
        if (!student) {
            debug('no student found');
            return done(null);
        }
        schoolslib.getSchools({
            _id: student.schoolId,enabled: true, active:true
        }, function(err, school) {
            if (err) {
                return done(err);
            }
            student.schoolName = _.first(school).name;
            delete student.schoolId;
            delete student.active;
            delete student.enabled;
            delete student.createdIso;
            delete student.updated;
            delete student.updatedIso;
            delete student.color;
            delete student.finalScore;
            districtslib.getDistricts({
                _id: _.first(school).distId,enabled: true, active:true
            }, function(err, district) {
                if (err) {
                    return next(err);
                }
                student.districtName = _.first(district).name;
                districtslib.getCounties({
                    _id: _.first(district).countyId,enabled: true, active:true
                }, function(err, county) {
                    if (err) {
                        return next(err);
                    }
                    student.countyName = _.first(county).name;
                    done(null, student);
                });
            });
        });
    }
};



//Code added by vivek starts

exports.extractParamsForPost = function(req, res, next) {
   // var form = new formidable.IncomingForm();
    var CountiesParameters = {};
   // form.parse(req, function(err, fields) {
      //  if (err) {
           // req.flash('error', 'Bad Request');
           // return res.render('/management');
         //  return next(err);
       // } else {
            CountiesParameters.name = req.body.countyname;
       // }
        req.store.set('CountiesParameters', CountiesParameters);
        next();
    //});
};

exports.createDistricts = function(req, res, next) {
   
    var data = req.body;
    var district = {};
    district.name = data.districtName;
    district.countyId = utils.toObjectId(req.body.e1);
    district.created = new Date().getTime();
    district.createdIso = new Date().toISOString();
    district.updated = new Date().getTime();
    district.updatedIso = new Date().toISOString();
    district.enabled = true;
    district.active=true; 
    var name = data.districtName;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
    districtslib.checkDistrictExist({name:regex}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{

           if(data.length){
                res.json({success:false,data:[],message:'District name already exist.'}); 
           }else{
              districtslib.createDistrict(district, function(err,result) {
                    if (err) {
                        res.json({success:false,data:[],message:err});
                    }else{
                      res.json({success:true,data:result,message:'District successfully created.'});
                    }
                });
           }
           
        }
    });
};



exports.create = function(req, res, next) {
    var data = req.body;
    var county = {};
    county.name = data.countyname;
    county.created = new Date().getTime();
    county.createdIso = new Date().toISOString();
    county.updated = new Date().getTime();
    county.updatedIso = new Date().toISOString();
    county.isOther = false;
    county.active = true;
    county.enabled = true;
    var name = data.countyname;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
     districtslib.checkCountyExist({name:regex,active:true, enabled: true}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
           if(data.length){
                res.json({success:false,data:[],message:[{'message':'County name already exist.'}]}); 
           }else{
               districtslib.createCounty(county, function(err,data) {
                    if (err) {
                       res.json({success:false,data:[],message:err});
                    }else{
                       res.json({success:true,data:[],message:'County successfully created.'});
                    }
                });
           }
           
        }
    });
};

exports.updateCounty = function(req, res, next) {
    var data = req.body;
    var county = {};
    county.name = data.countyname;
    county.createdIso = new Date().toISOString();
    county.updated = new Date().getTime();
    county.updatedIso = new Date().toISOString();
    var name = data.countyname;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
    districtslib.checkCountyExist({name:regex,_id:{$ne:utils.toObjectId(data.id)},active:true, enabled: true}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
           if(data.length){
                res.json({success:false,data:[],message:'County name already exist.'}); 
           }else{
              districtslib.updateCounty({_id:utils.toObjectId(req.body.id)},{$set: county}, function(err,data) {
                    if (err) {
                      res.json({success:false,data:[],message:err});
                    }else{
                      res.json({success:true,data:[],message:'County successfully updated.'});
                    }
                });
           }
           
        }
    });

    
};

exports.getallCounties = function(req, res, next) 
{
    districtslib.getCounties({active:true, enabled: true}, function(err, counties) 
    {
        if (err) {
            return next(err);
        }
        req.store.set('counties', counties);
        res.response = counties;
        next();
    });
};

exports.get_all_counties = function(req, res, next) 
{   
    var condition = {active:true, enabled: true};
    var data= req.query;
    if(data.from_date && data.to_date){
          condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    }

    districtslib.getCounties(condition, function(err, counties) 
    {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{
            res.json({success:true,data:counties,message:'County list.'});
        }
        
    });
};

exports.counties_count = function(req, res){
    districtslib.CountiesCount({active:true, enabled: true},function(err,counties_count) {
        if (err) {
          res.json({success:false,data:counties_count,message:''});
        }else{
           res.json({success:true,data:counties_count,message:''});
        }
        
    });
};

exports.total_counties = function(req, res, next){
    var data = req.body;
    var condition = {enabled:true,active:true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    districtslib.CountiesCount(condition,function(err,counties_count) {
        if (err) {
         return next(err);
        }else{
            counties_count = (counties_count) ? counties_count : 0;
            req.store.set('counties_count', counties_count);
            next();
        }
        
    });
};

exports.district_count = function(req, res, next){
    var data = req.body;
    var condition = {enabled:true,active:true};
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    districtslib.DistrictsCount(condition,function(err,districts_count) {
        if (err) {
         return next(err);
        }else{
            districts_count = (districts_count) ? districts_count : 0;
            req.store.set('districts_count', districts_count);
            next();
        }
        
    });
}

exports.districts_countby_countyId = function(req, res, next){
    var CID = utils.toObjectId(req.params.id);
    districtslib.DistrictsCount({countyId:CID, active:true, enabled: true},function(err,districts_count) {
        if (err) {
            return next(err);
        }
        req.store.set('districts_count', districts_count);
        req.store.districts_count = districts_count;
        next();
    });
};

exports.search_counties = function(req, res, next) {
    var Cname = req.query.name;
    async.series({
        counties: function(cb) {
            var query1 = {active: true, enabled: true};
            if(Cname){
               query1.name = new RegExp("^"+Cname, 'i');
            }
            districtslib.getCounties(query1, function(err, counties) {
                if (err) {
                    return next(err);
                }
                counties = counties;
                cb(null, counties);
            });
        },
    }, function(err, results) {
        res.status(200).json({
            results: results
        });
    });
};

exports.update = function(req, res, next) {
    var data = req.body;
    var district   = {}
    var districtId = utils.toObjectId(data.id);
    district.name  = data.districtName;
    district.updated    = new Date().getTime();
    district.updatedISO = new Date().toISOString();
    
    var name = data.districtName;
    var regex = new RegExp(["^", name, "$"].join(""), "i");
    districtslib.checkDistrictExist({name:regex,_id:{$ne:districtId},active:true, enabled: true}, function(err,data) {
        if (err) {
            res.json({success:false,data:[],message:err});
        }else{

           if(data.length){
                res.json({success:false,data:[],message:'District name already exist.'}); 
           }else{
              districtslib.updateDistrict({ _id:utils.toObjectId(districtId)},{$set: district},function(err) {
                    if (err) {
                        res.json({success:false,data:[],message:err});
                    }else{
                        res.json({success:true,data:[],message:'District successfully updated.'}); 
                  }
                });
           }
           
        }
    });
 
};

exports.search_districts = function(req, res, next) {
    var Dname   = req.params.query;
    if(req.params.id){
        var DID     = utils.toObjectId(req.params.id);
        var query1 = {"name": new RegExp(Dname, 'i'),'_id': {$ne :DID},active: true, enabled: true};
    }else{
        var query1 = {"name": new RegExp(Dname, 'i'),active: true, enabled: true};
    }
    async.series({
        districts: function(cb) {
            districtslib.getDistricts(query1, function(err, districts) {
                if (err) {
                    return next(err);
                }
                districts = districts;
                cb(null, districts);
            });
        },
    }, function(err, results) {
        res.status(200).json({
            results: results
        });
    });
};



exports.getTeachersFromCountyIdsorted = function(req, res, next) 
{
    schoolslib.getSchoolsData({
        _id: utils.toObjectId(req.params.sid),
        active: true,
        enabled: true
    }, {}, function(err, schools) {
        if (err) {
            return next(err);
        }
        req.store.schools = schools;
        var query = {
            _id: schools[0].distId,enabled: true, active:true
        };
        districtslib.getDistricts(query, function(err, districts) 
        {
            if (err) {
                return next(err);
            }
            req.store.set('districts', districts);
            var county_data = districts;
            var countyId = utils.toObjectId(req.params.id);
            var teacherId = utils.toObjectId(req.params.id);
            var query = {
                countyId: utils.toObjectId(county_data[0].countyId)
            };
            var query1;
            districtslib.getDistricts(query, function(err, districts) 
            {
                if (err) {
                    return next(err);
                }
                var teacher     = null;
                var distIdArr   = [];
                var schoolsIds  = [];
                var results     = [];
                var results1    = [];
                var results2    = [];
                //var district = {};
                async.series({
                    districts: function(callback) 
                    {
                        for (var i = 0; i < districts.length; i++) 
                        {
                            distIdArr.push(utils.toObjectId(districts[i]._id));
                            distIdArr.push(districts[i].name);
                        }
                        callback(null, districts);
                    },
                    admin_teachers: function(cb) 
                    {
                        query1 = {_id: utils.toObjectId(teacherId),enabled: true, active:true};

                        teacherslib.getTeachers(query1, function(err, admin_teachers) 
                        {
                            if (err) {
                                return next(err);
                            }
                            admin_teachers = admin_teachers;
                            cb(null, admin_teachers);
                        });
                    },
                    schools: function(callback) 
                    {
                        query = { distId: { $in: distIdArr },active: true,enabled: true};

                        schoolslib.getSchoolsData(query, {}, function(err, schools) 
                        {
                            if (err) {
                                return next(err);
                            }
                            for (var i = 0; i < schools.length; i++) 
                            {
                                schoolsIds.push(utils.toObjectId(schools[i]._id));
                                schoolsIds.push(schools[i].name);
                            }
                            callback(null, schools)
                        });
                    },
                    teachers: function(cb) 
                    {
                        query1 = { schoolId: { $in: schoolsIds },$or : [{admin_teacher : 1},{admin_teacher : '1'},{admin_teacher : 1.0},{admin_teacher:'1.0'}],enabled: true, active: true};

                        teacherslib.getTeachers(query1, function(err, teachers) 
                        {
                            if (err) {
                                return next(err);
                            }
                            teacher = teachers;
                            cb(null, teacher);
                        });
                    }
                }, function(err, results) {
                    for (var i = 0; i < results.districts.length; i++)
                    {
                        results1[i] = {};
                        if (results.districts[i]._id && results.districts[i].name)
                        {
                            results1[i].schools_new     = [];
                                            
                            for (var j = 0; j < results.schools.length; j++)
                            {
                                if (results.districts[i]._id.toString() === results.schools[j].distId.toString())
                                {
                                    var teachers_new = [];
                                    for (var k = 0; k < results.teachers.length; k++)
                                    {
                                        if (results.schools[j]._id.toString() === results.teachers[k].schoolId.toString())
                                        {
                                            if (results.teachers[k])
                                            {

                                                for (var l = 0; l < results.admin_teachers[0].associated_teachers_id.length; l++)
                                                {
                                                    if (results.admin_teachers[0].associated_teachers_id[l].toString().trim() === results.teachers[k]._id.toString().trim())
                                                    {
                                                        teachers_new.push(results.teachers[k]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (teachers_new && teachers_new.length > 0)
                                    {
                                        results.schools[j].teachers_new = teachers_new;

                                        //results.schools[j] && results.schools[j].noOfTeachers > 0 old condition

                                        if (results.schools[j] && results.schools[j].teachers_new)
                                        {
                                            results1[i].districts_id    = results.districts[i]._id;
                                            results1[i].districts_name  = results.districts[i].name;
                                            results1[i].schools_new.push(results.schools[j]);
                                        }
                                    }
                                }
                            }
                        }
                    }for (var i = 0; i < results1.length; i++) {
                        if(results1[i].schools_new.length>0)
                        {
                            results2.push(results1[i]);
                        }
                    }
                    res.status(200).json({
                        results: results2
                    });
                });
            });
        });
    });
};


exports.getTeachersFromCountyId = function(req, res, next) 
{
    var countyId;
    var query1;
    if (typeof req.params.id !== 'undefined') {
        countyId = utils.toObjectId(req.params.id);
    } else {
        countyId = utils.toObjectId(req.params.cid);
    }
    var query = {
        countyId: countyId,enabled: true, active:true
    };
    districtslib.getDistricts(query, function(err, districts) 
    {
        if (err) {
            return next(err);
        }
        var teacher     = null;
        var distIdArr   = [];
        var schoolsIds  = [];
        var results1    = [];
        var results2    = [];
        async.series({
            districts: function(callback) 
            {
                for (var i = 0; i < districts.length; i++) 
                {
                    distIdArr.push(utils.toObjectId(districts[i]._id));
                    distIdArr.push(districts[i].name);
                }
                callback(null, districts);
            },
            schools: function(callback) 
            {
                query = { distId: { $in: distIdArr }, active: true,  enabled: true };

                schoolslib.getSchoolsData(query, {}, function(err, schools) 
                {
                    if (err) {
                        return next(err);
                    }
                    for (var i = 0; i < schools.length; i++) 
                    {
                        schoolsIds.push(utils.toObjectId(schools[i]._id));
                        schoolsIds.push(schools[i].name);
                    }
                    callback(null, schools)
                });
            },
            teachers: function(cb) 
            {

                query1 = { schoolId: { $in: schoolsIds }, $or : [{admin_teacher : 1},{admin_teacher : 1.0},{admin_teacher : '1'},{admin_teacher:'1.0'}], enabled: true, active: true };

                teacherslib.getTeachers(query1, function(err, teachers) 
                {
                    if (err) {
                        return next(err);
                    }
                    teacher = teachers;
                    cb(null, teacher);
                });
            },
            loggedin_teacher: function(callback) 
            {
                var query2 = { _id: utils.toObjectId(req.params.tid)};

                teacherslib.getTeachers(query2, function(err, teacher_data) 
                {
                    if (err) {
                        return next(err);
                    }
                    teacher_data = teacher_data;
                    callback(null, teacher_data);
                });
            },
        }, function(err, results) {
            for (var i = 0; i < results.districts.length; i++) 
            {
                var district = {};
                if (results.districts[i]._id && results.districts[i].name) 
                {
                    district.districts_id = results.districts[i]._id;
                    district.districts_name = results.districts[i].name;
                    for (var j = 0; j < results.schools.length; j++) 
                    {
                        if (district.districts_id.toString() === results.schools[j].distId.toString()) 
                        {
                            district.school_id = results.schools[j]._id;
                            district.school_name = results.schools[j].name;
                        }
                        for (var k = 0; k < results.teachers.length; k++) 
                        {
                            if (district.school_id && district.school_id.toString() === results.teachers[k].schoolId.toString()) 
                            {
                                district.firstName = results.teachers[k].firstName;
                                district.lastName  = results.teachers[k].lastName;
                                district.email     = results.teachers[k].email;
                                district.teacher_id = results.teachers[k]._id;
                            }
                        }
                    }
                    results1.push(district);
                }
            }
            for (var i = 0; i < results1.length; i++) 
            {
                if (results1[i].teacher_id) 
                {
                    if (results.loggedin_teacher[0].associated_teachers_id) 
                    {
                        var associated_teachers = results.loggedin_teacher[0].associated_teachers_id;
                        for (var j = 0; j < associated_teachers.length; j++) 
                        {
                            if (results1[i].teacher_id.toString() === associated_teachers[j].toString()) 
                            {
                                results1[i].checked = 2;
                            } else {
                                results1[i].checked = 1;
                            }
                        }
                    } else {
                        results1[i].checked = 1;
                    }
                    results2.push(results1[i]);
                }
            }
            res.status(200).json({
                results: results2
            });
        });
    });
};


exports.GetcountybyTeachersId = function(req, res, next) 
{
    var teacher_id = utils.toObjectId(req.params.id);
    schoolslib.getSchoolsData({
        _id: utils.toObjectId(req.params.sid),
        active: true,
        enabled: true
    }, {}, function(err, schools) {
        if (err) {
            return next(err);
        }
        req.store.schools = schools;
        var query = {
            _id: schools[0].distId,enabled: true, active:true
        };
        districtslib.getDistricts(query, function(err, districts) 
        {
            if (err) {
                return next(err);
            }
            req.store.set('districts', districts);
            var county_data = districts;
            var query = {
                countyId: utils.toObjectId(county_data[0].countyId),enabled: true, active:true
            };
            districtslib.getDistricts(query, function(err, districts) 
            {
                if (err) {
                    return next(err);
                }
                var teacher     = null;
                var distIdArr   = [];
                var schoolsIds  = [];
                var results1    = [];
                var results2    = [];
                async.series({
                    districts: function(callback) 
                    {
                        for (var i = 0; i < districts.length; i++) 
                        {
                            distIdArr.push(utils.toObjectId(districts[i]._id));
                            distIdArr.push(districts[i].name);
                        }
                        callback(null, districts);
                    },
                    schools: function(callback) 
                    {
                        query = { distId: { $in: distIdArr },active: true, enabled: true };

                        schoolslib.getSchoolsData(query, {}, function(err, schools) 
                        {
                            if (err) {
                                return next(err);
                            }
                            for (var i = 0; i < schools.length; i++) 
                            {
                                schoolsIds.push(utils.toObjectId(schools[i]._id));
                                schoolsIds.push(schools[i].name);
                            }
                            callback(null, schools)
                        });
                    },
                    teachers: function(cb) 
                    {
                        var query1 = {schoolId: { $in: schoolsIds },$or:[{admin_teacher:1},{admin_teacher:"1"},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}], enabled: true, active: true};

                        teacherslib.getTeachersbytime(query1, function(err, teachers) 
                        {
                            if (err) {
                                return next(err);
                            }
                            teacher = teachers;
                            cb(null, teacher);
                        });
                    },
                    loggedin_teacher: function(callback) 
                    {
                        var query2 = { _id: utils.toObjectId(req.params.id)};

                        teacherslib.getTeachersbytime(query2, function(err, teacher_data) 
                        {
                            if (err) {
                                return next(err);
                            }
                            teacher_data = teacher_data;
                            callback(null, teacher_data);
                        });
                    },
                }, function(err, results) {
                    for (var k = 0; k < results.teachers.length; k++) 
                    {
                        var district = {};
                        district.firstName  = results.teachers[k].firstName;
                        district.lastName   = results.teachers[k].lastName;
                        district.email      = results.teachers[k].email;
                        district.teacher_id = results.teachers[k]._id;
                        district.school_id  = results.teachers[k].schoolId;
                        for (var i = 0; i < results.schools.length; i++) 
                        {
                            if (district.school_id.toString() === results.schools[i]._id.toString()) 
                            {
                                district.school_id      = results.schools[i]._id;
                                district.school_name    = results.schools[i].name;
                                district.districts_id   = results.schools[i].distId;
                            }
                        }
                        for (var i = 0; i < results.districts.length; i++) 
                        {
                            if (district.districts_id.toString() === results.districts[i]._id.toString()) 
                            {
                                district.districts_name = results.districts[i].name;
                            }
                        }
                        results1.push(district);
                    }
                    for (var i = 0; i < results1.length; i++) 
                    {
                        if (results1[i].teacher_id) 
                        {
                            if (results.loggedin_teacher[0].associated_teachers_id) 
                            {
                                var associated_teachers = results.loggedin_teacher[0].associated_teachers_id;
                                for (var j = 0; j < associated_teachers.length; j++) 
                                {
                                    if (results1[i].teacher_id.toString().trim() === associated_teachers[j].toString().trim()) 
                                    {
                                        results1[i].checked = 2;
                                        break;
                                    } else {
                                        results1[i].checked = 1;
                                    }
                                }
                            } else {
                                results1[i].checked = 1;
                            }
                            results2.push(results1[i]);
                        }
                    }
                    res.status(200).json({
                        results: results2
                    });
                });
            });
        });
    });
};


exports.extractParamsForEditPost = function(req, res, next) {
    var form = new formidable.IncomingForm();
    var districtParameters = {};
    form.parse(req, function(err, fields) {
        if (err) {
            req.flash('error', 'Bad Request');
            return res.render('/management');
        } else {
            districtParameters.name = fields.district_name
            districtParameters._id  = fields.district_id;
        }
        req.store.set('districtParameters', districtParameters);
        next();
    });
};

exports.getDistrictsByCountyIds = function(req, res, next) 
{   var ids = [];
    var data = req.body;
    var condition = {active : true,enabled : true};
    data.county_id.forEach(function(result){
        ids.push(utils.toObjectId(result));        
    })

    if(ids.length || data.filter){
       condition.countyId={$in:ids};
    }

    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 

   
    districtslib.getDistricts(condition, function(err, districts) 
    {
        if (err) {
            res.json({success:true,data:[],message:err});
        }else{
           res.json({success:true,data:districts,message:'Counties districts.'});
       }
    });
};

exports.getSchoolesByDistrictIds = function(req, res, next) 
{   var ids = [];
    var data = req.body;
    var condition = {active : true,enabled : true};
    data.district_id.forEach(function(result){
        ids.push(utils.toObjectId(result));        
    })
    if(ids.length || data.filter){
      condition.distId={$in:ids};
    }
    
    if(data.from_date && data.to_date){
        condition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    } 
    schoolslib.getSchools(condition, function(err, districts) 
    {
        if (err) {
            res.json({success:true,data:[],message:err});
        }else{
           res.json({success:true,data:districts,message:'Counties districts.'});
       }
    });
};

 

exports.countyPdfReport = function(req, res, next) 
{  
    var data =req.body;
      if(data.repor_type=='teacher'){
                var data = req.body;
              var studentsArr = [];
              var teachersArr =[];
              var countyData = [];
              async.waterfall([
          function teachers(callback){
            teacherslib.getTeachers({active: true,enabled: true,$or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'}]}, function(err, teachers) 
                {
                    if (err) {
                        return next(err);
                    }else{
                           teachersArr = teachers;
                         callback(null, teachers);
                   }
                });
           
          },
          function students(teachers, callback){
            studentslib.getStudents({active:true, enabled: true},function(err,students) {
                if (err) {
                  callback(err);
                }else{
                   
                    studentsArr =  students;
                   callback(null, teachers, students);
                }
            });   
           
          },
          function counties(teachers, students, callback){
               districtslib.getCounties({active : true,enabled : true}, function(err, counties) 
                {
                    if (err) {
                        callback(err);
                    }else{
                    
                      async.forEachOf(counties, function (county, countyKey, asyncCountyCallback) {
                           
                            countyData.push({id:county._id, name:county.name,districts:[]});
                            districtslib.getDistricts({active : true,enabled : true,countyId:county._id}, function(err, districts) 
                            {
                                if (err) {
                                    asyncCountyCallback(err);
                                }else{
                                     countyData[countyKey].districts = districts;    
                                    async.forEachOf(districts, function (district, distKey, asyncDistCallback) {
                                      // countyData[countyKey].districts[distKey] = [];

                                        schoolslib.getSchools({active : true,enabled : true,district:county._id}, function(err, schooles) 
                                        {
                                            if (err) {
                                                asyncCountyCallback(err);
                                            }else{
                                                 asyncDistCallback();
                                               //countyData[key].districts[distKey] = schooles;
                                            }
                                        }); 
                                     },function(err){
                                       
                                         if (err) {
                                                asyncCountyCallback(err);
                                            }else{ 
                                                  asyncCountyCallback();
                                        
                                            }   

                                     });
                                 }
                                 
                            });
                      
                        }, function (err) {
                            if (err) {
                                asynccountyCallback(err);
                            }else{
                                
                                callback(null, teachers, students, counties);
                            }                            
                        });
                    }
                     
                });
          }  
        ], function (err, result) {
            if(err){
               res.json({success:false,data:[],message:err});
            }else{
                 res.json({success:true,data:countyData,message:'Report.'});
                //  districtslib.exportPdf({html:html,file_name:data.file_name}, function(err, response) 
                //     {
                //         if (err) {
                //             res.json({success:true,data:[],message:err});
                //         }else{
                //             //countyData
                //            res.json({success:true,data:countyData,message:'Report.'});
                //        }
                // });
            }
    });
               
      }

}


exports.updateCountyAmount = function(req, res, next) {
    var data = req.body;
    var countyId = utils.toObjectId(data.id);
    var amount = data.amount;
    var year = data.year;
    var from_date = data.from_date;
    var to_date = data.to_date;
    var county  = {};
    //county.amount = data.amount;
   
     county.updated = new Date().getTime();
     county.updatedISO = new Date().toISOString();
     districtslib.getCountYByAttr({enabled:true,active:true,_id:utils.toObjectId(data.id)},{},function(err,data){
         if(err){
           res.json({success:false,data:[],message:err});
         }else if(data){
                 if(data.billing){
                     
                      if(data.billing.length){
                        var billingArr =[];
                  
                            data.billing.forEach(function(result,key){
                              billingArr.push(result); 
                              
                              if(result.year==year){
                                  billingArr[key].year=year;
                                  billingArr[key].amount=amount;
                                  billingArr[key].from_date=from_date;
                                  billingArr[key].to_date=to_date;
                              }else{
                                 var checkYearExist = data.billing.filter(function(obj){
                                    return obj.year==year;
                                 });
                                 if(!checkYearExist.length){
                                    billingArr.push({year:year,amount:amount,from_date:from_date,to_date:to_date}); 
                                 } 
                              }
                            });

                             county.billing= billingArr;
                             districtslib.updateCounty({
                                    _id: utils.toObjectId(countyId)
                                    }, {
                                        $set: county
                                    }, function(err,response) {
                                        if (err) {
                                            res.json({success:false,data:[],message:err});
                                        }else{
                                            res.json({success:true,data:[],message:'County successfully updated.'}); 
                                        }
                                        
                                });
                      }else{ 
                         county.billing=[{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                         districtslib.updateCounty({
                            _id: utils.toObjectId(countyId)
                            }, {
                                $set: county
                            }, function(err,response) {
                                if (err) {
                                    res.json({success:false,data:[],message:err});
                                }else{
                                    res.json({success:true,data:[],message:'County successfully updated.'}); 
                                }
                                
                            });
                      }
                       
                 }else{

                      county.billing = [{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                                          
                      districtslib.updateCounty({
                        _id: utils.toObjectId(countyId)
                        }, {
                            $set: county
                        }, function(err,response) {
                            if (err) {
                                res.json({success:false,data:[],message:err});
                            }else{
                                res.json({success:true,data:[],message:'County successfully updated.'}); 
                            }
                            
                        });
        
                 }
              
         }else{
            res.json({success:false,data:[],message:err});
         }
     });
                         
};

exports.updateDistrictAmount = function(req, res, next) {
    var data = req.body;
    var districtId = utils.toObjectId(data.id);
    var amount = data.amount;
    var year = data.year;
    var from_date = data.from_date;
    var to_date = data.to_date;
    var district  = {};
    //district.amount = data.amount;
   
     district.updated = new Date().getTime();
     district.updatedISO = new Date().toISOString();
     districtslib.getDistrictByAttr({enabled:true,active:true,_id:utils.toObjectId(districtId)},{},function(err,data){
         if(err){
           res.json({success:false,data:[],message:err});
         }else if(data){
                 if(data.billing){
                     
                      if(data.billing.length){
                        var districtArr =[];
                  
                            data.billing.forEach(function(result,key){
                              districtArr.push(result); 
                              
                              if(result.year==year){
                                  districtArr[key].year=year;
                                  districtArr[key].amount=amount;
                                  districtArr[key].from_date=from_date;
                                  districtArr[key].to_date=to_date;
                              }else{
                                 var checkYearExist = data.billing.filter(function(obj){
                                    return obj.year==year;
                                 });
                                 if(!checkYearExist.length){
                                    districtArr.push({year:year,amount:amount,from_date:from_date,to_date:to_date}); 
                                 } 
                              }
                            });

                            district.billing= districtArr;
                            districtslib.updateDistrict({
                                _id: utils.toObjectId(districtId)
                                }, {
                                    $set: district
                                }, function(err) {
                                    if (err) {
                                        res.json({success:false,data:[],message:err});
                                    }else{
                                        res.json({success:true,data:[],message:'District successfully updated.'}); 
                                    }
                                    
                                });  
                      }else{ 
                          district.billing=[{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                          districtslib.updateDistrict({
                                _id: utils.toObjectId(districtId)
                                }, {
                                    $set: district
                                }, function(err) {
                                    if (err) {
                                        res.json({success:false,data:[],message:err});
                                    }else{
                                        res.json({success:true,data:[],message:'District successfully updated.'}); 
                                    }
                                    
                                });  
                      }
                       
                 }else{

                      district.billing = [{year:year,amount:amount,from_date:from_date,to_date:to_date}];
                                          
                      districtslib.updateDistrict({
                        _id: utils.toObjectId(districtId)
                        }, {
                            $set: district
                        }, function(err) {
                            if (err) {
                                res.json({success:false,data:[],message:err});
                            }else{
                                res.json({success:true,data:[],message:'District successfully updated.'}); 
                            }
                            
                        });  
        
                 }
              
         }else{
            res.json({success:false,data:[],message:err});
         }
     });
                         
};

exports.updateDistrictStatus = function(req, res, next) {
    var data = req.body;
    var districtId = utils.toObjectId(data.id);
    var district  = {};
    if(data.type=='amount'){
      district.amount = data.value;
    }else if(data.type=='billed'){
        district.isBilled = data.value;
    }else if(data.type=='payed'){
         district.isPayed = data.value;
    }else if(data.type=='note'){
          district.note = data.value;
    }
    district.updated = new Date().getTime();
      
    district.updatedISO = new Date().toISOString();
          districtslib.updateDistrict({
            _id: utils.toObjectId(districtId)
            }, {
                $set: district
            }, function(err) {
                if (err) {
                    res.json({success:false,data:[],message:err});
                }else{
                    res.json({success:true,data:[],message:'District successfully updated.'}); 
                }
                
            });                     
        
};


exports.getDistrictsbyCounty = function(req, res, next) {
    if (typeof req.body.cid !== 'undefined') {
        var countyIdArr = [];
         req.body.cid.forEach(function(result){
            countyIdArr.push(utils.toObjectId(result));        
        })
        var query = {
            countyId: {
                $in: countyIdArr
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
    
    districtslib.getDistricts(query, function(err, districts) {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        next();
    });
};


exports.getCountiesByCountyIds = function(req, res, next) {
    if (req.body.county_id) {
        var ids = [];
        var data = req.body;
        data.county_id.forEach(function(result) {
            ids.push(utils.toObjectId(result));
        });
        var query = {
            active: true,
            enabled: true,
            _id: {
                $in: ids
            }
        };
    } else {
        var query = {
            active: true,
            enabled: true
        };
    }


    districtslib.getCounties(query, function(err, counties) {
        if (err) {
            return next(err);
        }
        req.store.set('counties', counties);
        next();
    });
};

exports.getDistrictsbyCountyIds = function(req, res, next) {
    if (req.body.cid) {
        var ids = [];
        var data = req.body;
        data.cid.forEach(function(result) {
            ids.push(utils.toObjectId(result));
        });
        var query = {
            active: true,
            enabled: true,
            _id: {
                $in: ids
            }
        };
    } else {
        var query = {
            active: true,
            enabled: true
        };
    }

    districtslib.getDistricts(query, function(err, districts) {
        if (err) {
            return next(err);
        }
        req.store.set('districts', districts);
        next();
    });
};

exports.getCountyDistrictAndSchools = function(req, res, next) {
  var data = req.body,
      teachersReportObj = {districts:0,schooles:0,counties:0},
      districtsArr =[],
      schoolsArr =[];
      async.waterfall([
            function counties(callback){
               var countyCondition = {active:true, enabled: true,isOther:{$ne:true}};
                if(data.from_date && data.to_date){
                    countyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }
               districtslib.getCounties(countyCondition,function(err,counties) {
                  if (err) {
                   callback(err);
                  }else{
                      teachersReportObj.counties = counties.length;
                      callback(null, counties);
                  }
                  
              });
             
            }, 
           function districts(counties, callback){
                var districtCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                    districtCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                } 
              async.forEachOf(counties, function (countyData, countyKey, asyncCountyCallback) {
                districtCondition.countyId = utils.toObjectId(countyData._id);
                districtslib.getDistricts(districtCondition,function(err,districts) {
                  if (err) {
                   callback(err);
                  }else{ 
                      districtsArr =  districtsArr.concat(districts);
                      teachersReportObj.districts += districts.length;
                      asyncCountyCallback();
                  }
                  
              });
              },function(err){
                 if(err){
                     callback(err);
                 }else{
                      callback(null, counties, districtsArr);
                 }
              });   
            },

        function schooles(counties, districts, callback){
                var schoolsCondition = {active:true, enabled: true};
                if(data.from_date && data.to_date){
                   schoolsCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                }

                async.forEachOf(districts, function (distData, distKey, asyncDistCallback) {
                  schoolsCondition.distId = utils.toObjectId(distData._id);

                  schoolslib.getSchoolsData(schoolsCondition,{},function(err,schooles) {
                      if (err) {
                       callback(err);
                      }else{ 
                          schoolsArr =  schoolsArr.concat(schooles);
                          teachersReportObj.schooles += schooles.length;
                           asyncDistCallback();

                      }                  
                  });  
                 
                },function(err){
                   if(err){
                      callback(err);
                   }else{
                       callback(null, counties, districts, schooles);
                   }
                });                
             
            } 
    
      ], function (err, result) {
        if(err){
          res.json({success:false,data:[],message:'Something went wrong.'});
        }else{
         // result now equals 'done' 
          res.json({success:true, data:teachersReportObj, message:'County, Districts and schools.'});
        }
        
      });
};
// code by vivek ends 