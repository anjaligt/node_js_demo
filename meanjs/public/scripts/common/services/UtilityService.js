/**
 * Created date 19/12/2016.
 */
!(function() {
    'use strict';

    angular.module('firstFiveApp').service('UtilityService', ['$localStorage', '$location', '$q','$filter','$http','$timeout','appConstant', function($localStorage, $location, $q,$filter,$http,$timeout,appConstant) {
            /* Set Local Storage */
            this.setLocalStorage = function(index, data) {
                $localStorage[index] = data;
            };

            /* Get Local Storage */
            this.getLocalStorage = function(index) {
                if ($localStorage[index]) {
                    return $localStorage[index];
                } else {
                    return false;
                }
            };

            /* Remove Local Storage */
            this.removeLocalStorage = function(index) {
                delete $localStorage[index];
            };

            /* Check User Login */
            this.checkUserLogin = function() {
                // Removes all local storage
                if (this.getLocalStorage('user')) {
                    return true;
                } else {
                    return false;
                }
            };

            /* Get Login User Detail */
            this.getUserInfo = function() {
                return this.getLocalStorage('user');
            };
            
            /* Remove range slider */
            this.removeToast = function(){
                toastr.remove(); 
            };

            /* service to set toaster */
            this.showToast = function(type, message) {
                toastr.options = {
                    "closeButton": true,
                    "positionClass": "toast-top-right",
                    "preventDuplicates": true,
                    "showDuration": "300",
                    "hideDuration": "1000",
                    "timeOut": "8000",
                    "extendedTimeOut": "1000",
                    "showEasing": "swing",
                    "hideEasing": "linear",
                    "showMethod": "fadeIn",
                    "hideMethod": "fadeOut"
                };
                //toastr.remove();
                toastr[type](message);

            };

            /* Get Login User Access Token*/
            this.getUserAccessToken = function() {
                var user = false;
                if (this.getLocalStorage('user')) {
                    userInfo = this.getLocalStorage('user');
                    if (userInfo.hasOwnProperty('access_token')) {
                        return userInfo.access_token;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            };

            /* Get Login User Access Token*/
            this.getLoginUserId = function() {
                var user = false;
                if (this.getLocalStorage('user')) {
                    user = this.getLocalStorage('user');
                    if (user.hasOwnProperty('access_token')) {
                        return user._id;
                    } else {
                        return '';
                    }
                } else {
                    return '';
                }
            };
            
            this.pinCode = function(){
                var currentYear = moment().format('YY');
                var nextYear = parseInt(currentYear)+1;
                var pin = currentYear+''+nextYear;
               return pin;
            }

            this.reinitializeTable= function(id){
                $('#'+id).dataTable().fnClearTable();
                $('#'+id).dataTable().fnDestroy();
            }

            this.initializeDataTable= function(id,options){
                options = (options) ? options : {};
                 $timeout(function(){
                  $("#"+id).DataTable({order: [],
                    "language": {
                        "lengthMenu": "Display _MENU_ records per page",
                        "info": "Showing page _PAGE_ of _PAGES_"
                    },
                    columnDefs: [options]});
                },1000);
            }

             this.changeDateToTime = function(d) {
                var d = moment.utc(d).toDate();
                var m = moment(d).format('MM/DD/YYYY HH:mm A');                
                return m;
            };
            
            this.getLastSevenDays = function() {
            var dateObj = {dateObject:[],showDate:[]};    
            var fromDate = moment();
            var toDate = moment(); 
               fromDate.set({hour:0,minute:0,second:0,millisecond:0});
               fromDate = fromDate.format('YYYY-MM-DD HH:mm:ss');
               fromDate = moment(fromDate);  

               toDate.set({hour:23,minute:50,second:0,millisecond:0});
               toDate = toDate.format('YYYY-MM-DD HH:mm:ss'); 
               toDate = moment(toDate);
            
                dateObj.dateObject.push({from:fromDate.toDate().toISOString(), to:toDate.toDate().toISOString()});

            var showDateFormate = moment();    
                dateObj.showDate.push(showDateFormate.format("MMM DD"));
              for(var i=1;i<7;i++){
                fromDate = fromDate.subtract(1, "days");
                toDate = toDate.subtract(1, "days");
                dateObj.dateObject.push({from:fromDate.toDate().toISOString(), to:toDate.toDate().toISOString()});
              
                showDateFormate = showDateFormate.subtract(1, "days");
                dateObj.showDate.push(showDateFormate.format("MMM DD"));
              }
                dateObj.dateObject.reverse();
                dateObj.showDate.reverse();
              
                return dateObj;
            }

            this.convertAssessmentYear = function(yearRange){
                 var yearObj = {};
                 var yearArr = yearRange.split("-");
                 yearObj.year =yearRange;
                 yearObj.from_date = yearArr[0]+'-08-01T00:00:00.000Z';
                 yearObj.to_date = yearArr[1]+'-05-31T23:59:00.000Z';
                 yearObj.assessment_from_date = yearArr[0]+'-08-01';
                 yearObj.assessment_to_date = yearArr[1]+'-05-31';
                 
                 return yearObj;
            };

            this.curentAssessmentYear = function(){
                var currentYear = moment().format('YYYY'),
                    previousYear = currentYear-1,
                    yearRange = previousYear+'-'+currentYear; 
                    
                return yearRange;
            };

            this.filterYearsList = function(){
                var currentYear = moment().format('YYYY'),
                    currentYear = parseInt(currentYear);
                var lastYearToLast = currentYear-2,
                    lastyear = currentYear-1,
                    nextYear = currentYear+1,
                    yearsArr = [];

                    yearsArr.push(lastYearToLast+'-'+lastyear);
                    yearsArr.push(lastyear+'-'+currentYear); 
                    yearsArr.push(currentYear+'-'+nextYear);
                
                return yearsArr;
            };

        
             
        }]);
            
          
            
            

})();