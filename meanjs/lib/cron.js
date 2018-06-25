'use strict';
// var debug = require('debug')('ff:cron');

// var createCsv = require('./createCsv');
var teacherslib     = require('./db/teachers');


function cronSetup() {
   var CronJob = require('cron').CronJob;
  // debug('set cron job on session end');
  // // // */10 * * * * *  10 seconds
  // new CronJob('*/2 * * * * *', function(){
  //   createCsv();

  // }, null, true, '');

  new CronJob('0 */60 * * * *', function(){
  	 var dateObj = new Date(),
       currentYear = dateObj.getFullYear(),
       previousYear = currentYear-1,
       yearRange = previousYear+'-'+currentYear;
  	teacherslib.getAppSettingByAttr({assessment_year:yearRange}, function (err, appSetting) {
        if (err) {
                 
            } else if(!appSetting){
            	        var date        = new Date();
					    var month       = date.getMonth();
					    var june        = 5;
					    var currentYear, nextYear;
					    if(month >= june) {
					        currentYear = date.getFullYear();
					        nextYear    = date.getFullYear()+1;
					    } else {
					        currentYear = date.getFullYear()-1;
					        nextYear    = date.getFullYear();
					    }
					    var pin = currentYear.toString().substr(2,2) + nextYear.toString().substr(2,2);
                        var data = {pin:pin,
                          app_status:true, 
                          assessment_from: currentYear+'-06-01T00:00:00.000Z', 
                          assessment_to:currentYear+'-09-30T00:00:00.000Z', 
                          assessment_year:yearRange};
                teacherslib.createSetting(data, function(err, settings) {
                 if(err){
                    
                 }else{
                   
                 }
                });
            }
        });
  

  }, null, true, '');
}

exports = module.exports = cronSetup;