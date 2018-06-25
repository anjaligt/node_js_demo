'use strict';
var schoolslib = require('../../lib/db/schools');
var teacherslib = require('../../lib/db/teachers');
var districtslib = require('../../lib/db/districts');
var utils = require('../../lib/utils');
var BadRequest = require('../../errors/errors').BadRequest;
var errMsg = require('../../errors/errorCodes');
var _ = require('underscore');
var formidable = require('formidable');
var async = require('async');


exports.extractParams = function(req, res, next) {
    var counties = req.store.counties;
    var districts = req.store.districts;
    var schools = req.store.schools;
    var teachers = req.store.teachers;
    var results1 = [];
    var results2 = [];


    for (var i = 0; i < counties.length; i++) {

        var counties_noOfTeachers = 0;
        
        results1[i] = {};

        if (counties[i]._id && counties[i].name) {

            results1[i].districts_new = [];

            for (var j = 0; j < districts.length; j++) {

                var districts_noOfTeachers = 0;

                if(districts[j] && districts[j].name && districts[j].countyId){

                    if (counties[i]._id.toString() === districts[j].countyId.toString()) {
                        var schools_new = [];

                        for (var k = 0; k < schools.length; k++) {

                            if (districts[j]._id && schools[k].distId) {

                                if (districts[j]._id.toString() === schools[k].distId.toString()) {
                                    if (schools[k]) {

                                        districts_noOfTeachers += parseInt(schools[k].noOfTeachers); 
                                        counties_noOfTeachers  += parseInt(schools[k].noOfTeachers); 

                                        schools_new.push(schools[k]);
                                    }
                                }
                            }else{
                                schools_new = [];
                            }
                        }
                        //if (schools_new && schools_new.length > 0) {
                            districts[j].schools_new = schools_new;
    
                            districts[j]['noOfTeachersForDistrict'] = districts_noOfTeachers;

                            results1[i].districts_new.push(districts[j]); 
                        //}
                    }
                }
                else{
                    results1[i].districts_new = [];
                }
            }

        }
        results1[i].counties_noOfTeachers = counties_noOfTeachers;
        results1[i].county_id     = counties[i]._id;
        results1[i].county_name  = counties[i].name;
        results1[i].county_amount  = (counties[i].amount) ? counties[i].amount : 0;
    }for (var i = 0; i < results1.length; i++) {
        // if(results1[i].districts_new){
        //     if(results1[i].districts_new.length>0)
        //     {
            results2.push(results1[i]);
            //}

        //}
        
    }
    res.json({
        'success': true,
        data: results2,
        message: 'Billing list.'
    });

};


exports.getAllBillingCounties = function(req, res, next) {
    var data = req.body;
    var countyArr = [];
    var countyCondition = {enabled:true,active:true};
    // if(data.from_date && data.to_date){
    //     countyCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
    // } 

     if(data.isOtherCondition){
         countyCondition.isOther = {$ne:true};
     } 

    districtslib.getCounties(countyCondition,function(err,counties){
          if(err){
            res.json({
                    'success': false,
                     data: [],
                    message: err
                });
          }else{
             async.forEachOf(counties, function (county, countyKey, asyncCountyCallback) {
              //Year Wise Filter County amount 
              var county_amount = 0;
               
                if(county.billing){
                  var checkBilling = county.billing.filter(function(obj){
                    return obj.year==data.year;
                  });
                  if(checkBilling.length){
                     county_amount = (checkBilling[0].amount) ? checkBilling[0].amount : 0;
                  }
                }else{
                  county_amount = 0;
                }

                  countyArr.push({
                    county_amount : county_amount,
                    county_id : county._id,
                    county_name : county.name,
                    districts_new : []
                  });
                  
                   var districtCondition = {enabled:true,active:true,countyId:utils.toObjectId(county._id)};
                    // if(data.from_date && data.to_date){
                    //     districtCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                    // } 
                   districtslib.getDistricts(districtCondition,function(err,districts){
                     if(err){
                       asyncCountyCallback(err);
                     }else{
                        countyArr[countyKey].districts_new = districts; 


                          async.forEachOf(districts, function (district, distKey, asyncDistCallback) {
                            //Year Wise Filter District amount 
                            var district_amount = 0;
               
                              if(district.billing){
                                var checkDistBilling = district.billing.filter(function(obj){
                                  return obj.year==data.year;
                                });
                                if(checkDistBilling.length){
                                   district_amount = (checkDistBilling[0].amount) ? checkDistBilling[0].amount : 0;
                                }
                              }else{
                                district_amount = 0;
                              }
                           
                            countyArr[countyKey].districts_new[distKey].amount = district_amount;

                             var schoolCondition = {enabled:true,active:true,distId:utils.toObjectId(district._id)};
                              // if(data.from_date && data.to_date){
                              //     schoolCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                              // } 

                            schoolslib.getSchools(schoolCondition,function(err,schooles){
                               if(err){
                                  asyncDistCallback(err);
                               }else{ 

                                 countyArr[countyKey].districts_new[distKey].schools_new = schooles;

                                async.forEachOf(schooles, function (school, schoolKey, asyncSchoolCallback) {
                                   //Year Wise Filter School amount 
                                   var school_amount = 0;

                                    if(school.billing){
                                      var checkSchoolBilling = school.billing.filter(function(obj){
                                        return obj.year==data.year;
                                      });
                                      if(checkSchoolBilling.length){
                                         school_amount = (checkSchoolBilling[0].amount) ? checkSchoolBilling[0].amount : 0;
                                      }
                                    }else{
                                      school_amount = 0;
                                    }
                   
                                    countyArr[countyKey].districts_new[distKey].schools_new[schoolKey].amount = school_amount; 
                                     
                                     var teacherCondition = {enabled:true,active:true,schoolId:utils.toObjectId(school._id),$or:[{admin_teacher:1},{admin_teacher:'1'},{admin_teacher:'1.0'},{admin_teacher:1.0}]};
                                     if(data.from_date && data.to_date){
                                          teacherCondition.createdIso = {$gte:data.from_date, $lte:data.to_date};
                                      } 
                                     teacherslib.TeachersCount(teacherCondition,function(err,teacherCount){
                                      if(err){
                                        asyncSchoolCallback(err);
                                      }else{
                                        countyArr[countyKey].districts_new[distKey].schools_new[schoolKey].noOfTeachers = teacherCount;
                                        asyncSchoolCallback();
                                      }
                                   });
                                },function(err){
                                    if(err){
                                        asyncDistCallback(err);
                                    }else{
                                         asyncDistCallback();
                                    }
                                });
     
                               }
                            });

                            
                          },function(err){
                            if(err){
                               asyncCountyCallback(err);
                            }else{
                               asyncCountyCallback();
                            }
                          })

                        
                     }
                   });

                   
                },function(){
                    if(err){
                        res.json({
                            'success': false,
                             data: [],
                             message: err
                        });
                    }else{
                           res.json({
                            'success': true,
                            data: countyArr,
                            message: 'Billing list.'
                        });
                    }
                })
              
          }
    });

   
};