!(function() {
    angular.module('firstFiveApp').controller('DashboardController', ['$scope', '$state','$timeout', '$ngBootbox', '$stateParams', 'UtilityService', 'DashboardService','appConstant', function($scope, $state,$timeout, $ngBootbox, $stateParams, UtilityService, DashboardService,appConstant) {
        $scope.dashboardReportData = []; 
        $scope.reportTeacherData =[];
        $scope.assesmentCompletion = [];
        $scope.labels = ["Teachers Registered","Teachers Logged In"];
        $scope.reportTeachColors = ["#73879c", "#FFFF00"];
        $scope.yearDropDown = "2016-2017";
        $scope.registered_teachers = 0;
        $scope.loggedin_teachers = 0;
        $scope.total_students = 0;
        $scope.total_schooles = 0;
        $scope.total_counties =0;
        $scope.total_districts = 0;
        $scope.gross_profit = 0;
        $scope.ipe_percent = 0;
        $scope.ps_percent = 0;
        $scope.tk_percent = 0;
        $scope.billingCountyList = [];
        $scope.countyList = [];
        $scope.districtsList = [];
        $scope.schoolesList = [];
        $scope.billingAmount =[];
        $scope.globalAssessmentLabels = ["Not Assessed","Numeracy","Soc/Phy/Emo", "Literacy"];
        $scope.globalAssessmentColors = ["#b3b300", "#49A9EA","#FFFF00", "#8F9FAF"];
        $scope.globalAssessmentData = [];
        $scope.notAssessedArr = [];
        $scope.consolidate = [];
        $scope.numeracy = [];
        $scope.socials = [];
        $scope.consolidateLabels = ["Poor","Good","Very Good"];
        $scope.consolidateColors = ["#FF0000", "#FFFF00", "#228B22"];
        $scope.assessmentLabels = UtilityService.getLastSevenDays().showDate;
        $scope.assessmentData = [[50,30,100],[],[]];
        $scope.assessmentColors = ["#8F9FAF", "#49A9EA", "#FFFF00"];
        $scope.countiesAarr = [];
        $scope.countiesIds = [];
        $scope.districtAarr = [];
        $scope.districtIds = [];
        $scope.schoolArr = [];
        $scope.schoolIds = [];
        $scope.teachersArr = [];
        $scope.teacherIds =[];
        $scope.studentReportData = {fields:['First Name', 'Last Name', 'Created', 'Gender', 'DOB','First Language','IEP', 'Pre-School', 'Transitional','Teacher Name'],data:[]};
        $scope.allCountyChk = true;
        $scope.allDistrictChk =true;
        $scope.allSchoolChk =true;
        $scope.literacyNumeSocialArr = [];
        $scope.dashboardTools =[];
        $scope.greenYelloRedReport = [];
        $scope.multiFilterReport = ''; 
        $scope.emailForm = angular.copy(DashboardService.emailForm);
        $scope.billingGrossProfit = 0;
        $scope.dashboardYear = UtilityService.curentAssessmentYear();
        $scope.detailedReportYear = UtilityService.curentAssessmentYear();
        $scope.dataDownloadReportYear = UtilityService.curentAssessmentYear();
        $scope.toolsPageReportYear = UtilityService.curentAssessmentYear();
        $scope.filterYears = UtilityService.filterYearsList();
        $scope.filterCountyLength = 0;
        $scope.filterDistrictLength = 0;
        $scope.filterSchoolLength = 0;
        $scope.filterTeacherLength = 0;
        $scope.totalStudentsCount = [];
        $scope.studentsReportData = [];
        $scope.registeredTeachers =[]; 
        var emailReportHtml = '';
        var litPoor = 8,
              litGood = 11,
              litVeryGood = 15,
              numePoor = 9,
              numeGood = 12,
              numeVeryGood = 16,
              socPoor = 4,
              socGood = 6,
              socVeryGood = 9;
                  
         /*
        * Get all billing county
        */        
         $scope.getAllBillingCounties = function(){
          $scope.billingCountyList =[];
          var yearObj = UtilityService.convertAssessmentYear($scope.dashboardYear);
          var data = {year:$scope.dashboardYear,
                      from_date:yearObj.from_date,
                      to_date:yearObj.to_date, isOtherCondition:true};
          $scope.billingGrossProfit = 0;
           DashboardService.getAllBillingCounties(data)
           .then(function(response) {
               if(response.status==200){
                angular.forEach(response.data.data,function(result,count){ 
                  $scope.billingCountyList.push({name:result.county_name,amount:0});
                       angular.forEach(result.districts_new,function(districtData){
                         angular.forEach(districtData.schools_new,function(schoolResult){
                            $scope.billingCountyList[count]['amount'] += (schoolResult.amount) ? schoolResult.amount : 0; // Add School Amount
                          });
                         $scope.billingCountyList[count]['amount'] += (districtData.amount) ? districtData.amount : 0; // Add District Amount
                      });
                       $scope.billingCountyList[count]['amount'] += (result.county_amount) ? result.county_amount : 0; // Add County Amount
                       $scope.billingGrossProfit += $scope.billingCountyList[count]['amount'];
                });
             
                  
              }
          
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };
        $timeout(function(){
             $scope.getAllBillingCounties(); 
        },200);
        
          
          /*
           * Function for get all details of teachers, counties, schooles, students
           */
          $scope.teacherDashboardCharts = function(){
           $scope.dashboardPage = false;
           $scope.dashboardLoader = true;
           $scope.registeredTeachers =[]; 
          
           var year = UtilityService.convertAssessmentYear($scope.dashboardYear);
          DashboardService.teacherDashboardCharts(year)
           .then(function(response) {
              if(response.data.success){
                $scope.reportTeacherData[0]= response.data.data.registered_teachers.length;
                $scope.reportTeacherData[1]= response.data.data.loggedin_teacher;
                $scope.registered_teachers = response.data.data.registered_teachers.length;
                $scope.loggedin_teachers = response.data.data.loggedin_teacher;  
                $scope.total_students = response.data.data.students;
                $scope.registeredTeachers = response.data.data.registered_teachers;
                $scope.gross_profit = response.data.data.gross_profit.toFixed(2);
                $scope.ipe_percent = response.data.data.iep.toFixed(2);
                $scope.ps_percent = response.data.data.ps.toFixed(2);
                $scope.tk_percent = response.data.data.tk.toFixed(2);
                
                $scope.calculateConsolidatePercent(response.data.data);
                $scope.calculateGlobalAssessment(response.data.data); 
                $scope.calLastSevenDaysAsmnt(response.data.data);
               }
              $scope.dashboardPage = true;
              $scope.dashboardLoader = false;  
            }, function(error) {
              $scope.dashboardPage = true;
              $scope.dashboardLoader = false;
                // UtilityService.showToast('error','Something went wrong.');
            });
         };

         $scope.teacherDashboardCharts();

         /*
          *  Calculate consolidate percentage
          */ 
         $scope.calculateConsolidatePercent = function(data){
              var literacy = [];
              var numeracy = [];
              var social = [];
              /*
              * Literacy calculation
              */
                angular.forEach(data.registered_teachers,function(teachObj){
                   var literacyStudents =  data.literacy.filter(function(obj){
                       return obj.teacherId.toString() == teachObj._id.toString();
                   });
                   literacy = literacy.concat(literacyStudents);
                });
                
                var literacyPoorNumRecord =  literacy.filter(function(obj){
                       return obj.score <= litPoor;
                });
                var literacyPoorPercent = (literacyPoorNumRecord.length/literacy.length)*100;
                literacyPoorPercent = literacyPoorPercent.toFixed(2);
                
                var literacyGoodNumRecord =  literacy.filter(function(obj){
                       return obj.score > litPoor && obj.score <= litGood;
                });
                var literacyGoodPercent = (literacyGoodNumRecord.length/literacy.length)*100;
                literacyGoodPercent = literacyGoodPercent.toFixed(2);
                

                var literacyVeryGoodNumRecord =  literacy.filter(function(obj){
                       return obj.score > litGood;
                });
                var literacyVeryGoodPercent = (literacyVeryGoodNumRecord.length/literacy.length)*100;
                
                literacyVeryGoodPercent = literacyVeryGoodPercent.toFixed(2);
                $scope.consolidate[0] = (literacyPoorPercent=='NaN') ? '0.00' : literacyPoorPercent;
                $scope.consolidate[1] = (literacyGoodPercent=='NaN') ? '0.00' : literacyGoodPercent;
                $scope.consolidate[2] = (literacyVeryGoodPercent=='NaN') ? '0.00' : literacyVeryGoodPercent;
               
                /* 
                * Numeracy calculation 
                */
                angular.forEach(data.registered_teachers,function(teachObj){
                   var numeracyStudents =  data.numeracy.filter(function(obj){
                       return obj.teacherId.toString() == teachObj._id.toString();
                   });
                   numeracy = numeracy.concat(numeracyStudents);
                });

                var numeracyPoorNumRecord =  numeracy.filter(function(obj){
                       return obj.score <= numePoor;
                });
                 var numeracyPoorPercent = (numeracyPoorNumRecord.length/numeracy.length)*100;
                numeracyPoorPercent = numeracyPoorPercent.toFixed(2);
                 

                 var numeracyGoodNumRecord =  numeracy.filter(function(obj){
                       return obj.score > numePoor && obj.score <= numeGood;
                });
                 var numeracyGoodPercent = (numeracyGoodNumRecord.length/numeracy.length)*100;
                numeracyGoodPercent = numeracyGoodPercent.toFixed(2);
                

                var numeracyVeryGoodNumRecord =  numeracy.filter(function(obj){
                       return obj.score > numeGood;
                });
                 var numeracyVeryGoodPercent = (numeracyVeryGoodNumRecord.length/numeracy.length)*100;
                numeracyVeryGoodPercent = numeracyVeryGoodPercent.toFixed(2);

                $scope.numeracy[0] = (numeracyPoorPercent=='NaN') ? '0.00' : numeracyPoorPercent;
                $scope.numeracy[1] = (numeracyGoodPercent=='NaN') ? '0.00' : numeracyGoodPercent;
                $scope.numeracy[2] = (numeracyVeryGoodPercent=='NaN') ? '0.00' : numeracyVeryGoodPercent;
               
                  
                /* 
                * Social calculation 
                */
                 angular.forEach(data.registered_teachers,function(teachObj){
                   var socialStudents =  data.social.filter(function(obj){
                       return obj.teacherId.toString() == teachObj._id.toString();
                   });
                   social = social.concat(socialStudents);
                });

                var socialPoorNumRecord =  social.filter(function(obj){
                       return obj.score <= socPoor;
                });
                 
                 var socialPoorPercent = (socialPoorNumRecord.length/social.length)*100;
                socialPoorPercent = socialPoorPercent.toFixed(2);
                 

                 var socialGoodNumRecord =  social.filter(function(obj){
                       return obj.score > socPoor && obj.score <= socGood;
                });
                  
                 var socialGoodPercent = (socialGoodNumRecord.length/social.length)*100;
                socialGoodPercent = socialGoodPercent.toFixed(2);
                 

                var socialVeryGoodNumRecord =  social.filter(function(obj){
                       return obj.score > socGood;
                });
                  
                 var socialVeryGoodPercent = (socialVeryGoodNumRecord.length/social.length)*100;
                socialVeryGoodPercent = socialVeryGoodPercent.toFixed(2);

                 
               
                 $scope.socials[0] = (socialPoorPercent=='NaN') ? '0.00' : socialPoorPercent;
                $scope.socials[1] = (socialGoodPercent=='NaN') ? '0.00' : socialGoodPercent;
                $scope.socials[2] = (socialVeryGoodPercent=='NaN') ? '0.00' : socialVeryGoodPercent;
         };

         $scope.calculateGlobalAssessment = function(data){
           $scope.numeracyCount = 0;
           $scope.socialCount = 0;
           $scope.litaracyCount = 0;
           $scope.totalStudentsCount = [];
          angular.forEach(data.numeracy,function(num){
            var checkNumStudentIdExist = $scope.notAssessedArr.indexOf(num.studentId);
            if(checkNumStudentIdExist==-1){
               $scope.notAssessedArr.push(num.studentId);
            }
            });

          angular.forEach(data.social,function(soc){
            var checkSocStudentIdExist = $scope.notAssessedArr.indexOf(soc.studentId);
            if(checkSocStudentIdExist==-1){
               $scope.notAssessedArr.push(soc.studentId);
            }
          });

           angular.forEach(data.literacy,function(soc){
            var checkLiteracyStudentIdExist = $scope.notAssessedArr.indexOf(soc.studentId);
            if(checkLiteracyStudentIdExist==-1){
               $scope.notAssessedArr.push(soc.studentId);
            }
          });

           angular.forEach($scope.registeredTeachers,function(numData){
              var teachersNumeracyArr = data.numeracy.filter(function(numObj){
                             return numObj.teacherId.toString() == numData._id.toString();
                        });
              $scope.numeracyCount += teachersNumeracyArr.length;
           });

           angular.forEach($scope.registeredTeachers,function(socData){
              var teachersSocialArr = data.social.filter(function(socObj){
                             return socObj.teacherId.toString() == socData._id.toString();
                        });
             $scope.socialCount += teachersSocialArr.length;
           });

           angular.forEach($scope.registeredTeachers,function(litData){
              var teachersLiteracyArr = data.literacy.filter(function(litObj){
                             return litObj.teacherId.toString() == litData._id.toString();
                        });
             $scope.litaracyCount += teachersLiteracyArr.length;
           });
          
          var studentglobalAssmnt = data.students-$scope.notAssessedArr.length;
          var not_assessed = $scope.total_students-$scope.litaracyCount;
          $scope.globalAssessmentData[0] = (not_assessed>=0) ? not_assessed : 0; 
          $scope.globalAssessmentData[1] = $scope.numeracyCount;
          $scope.globalAssessmentData[2] = $scope.socialCount;
          $scope.globalAssessmentData[3] = $scope.litaracyCount;
           
        };


        $scope.calLastSevenDaysAsmnt = function(data){
          $scope.assessmentData = [[],[],[]];
          var dateArr = UtilityService.getLastSevenDays().dateObject;
          
         /*
          * Literacy calculate 
          */
          angular.forEach(dateArr,function(lit,count){
            var literacyDates = data.literacy.filter(function(obj){
              return obj.createdIso>=lit.from && obj.createdIso<=lit.to;
            });
             if(literacyDates.length){
               $scope.assessmentData[0].push(literacyDates.length);
            }else{
               $scope.assessmentData[0].push(0);
            }
          });

           //console.log($scope.assessmentData);

           /*
          * Numeracy calculate 
          */
          angular.forEach(dateArr,function(num,count){
            var numeracyDates = data.numeracy.filter(function(obj){
              return obj.createdIso>=num.from && obj.createdIso<=num.to;
            });
             if(numeracyDates.length){
               $scope.assessmentData[1].push(numeracyDates.length);
            }else{
               $scope.assessmentData[1].push(0);
            }
          });

           //console.log($scope.assessmentData);

          /*
          *  Social calculate 
          */
          angular.forEach(dateArr,function(soc,count){
            var socialDates = data.social.filter(function(obj){
              return obj.createdIso>=soc.from && obj.createdIso<=soc.to;
            });
            
             if(socialDates.length){
               $scope.assessmentData[2].push(socialDates.length);
            }else{
               $scope.assessmentData[2].push(0);
            }
          });

           //console.log($scope.assessmentData);

        };

         

	    $scope.accordianTab = function(index){
		    $("#accordianTab_"+index).toggleClass('in');
	    };

       $scope.changeTab = function(id){
        $(".tab-class").removeClass('active');
        $(".tab-class").removeClass('in');
        $("#"+id).addClass('in');
        $("#"+id).addClass('active');
         $scope.hideToolsLnk = false;
         $scope.downloadPage = false;
         $scope.toolsPage = false;
         $scope.countiesAarr = [];
         $scope.countiesIds = [];
         $scope.districtAarr = [];
         $scope.districtIds = [];
         $scope.schoolArr = [];
         $scope.schoolIds = [];
         $scope.teachersArr = [];
      };



      $scope.getDivElement = function(){
        var element = $("#dashboardDiv").html();
        
        DashboardService.exportPdf({data:element})
           .then(function(response) {
              if(response.data.success){
              }
          
            }, function(error) {
                // UtilityService.showToast('error','Something went wrong.');
            });
      };

      $scope.countyFilterForm = function(isFilter){
          $scope.multiFilterReport = isFilter;
          $scope.filterForm.$setPristine();
          $scope.filterForm.$setUntouched();
          $("#countyFilterFormPopup").modal('show');
          $scope.getAllCounties();
      };

      function refreshSelectPicker(){
         $timeout(function(){
               $('.select-picker').selectpicker('refresh');
               },500);
      }
      
       

        /*
         * Get all county
         */          
         $scope.getAllCounties = function(){
          var yearObj = UtilityService.convertAssessmentYear($scope.detailedReportYear);
          $scope.countyList = [];
          $scope.districtsList = [];
          $scope.schoolesList = []; 
           DashboardService.getAllCounties({from_date:yearObj.from_date,to_date:yearObj.to_date})
           .then(function(response) {
               if(response.data.success){
                  $scope.countyList = response.data.data
               } 
               $('.select-picker').selectpicker("destroy"); 
               $('.select-picker').selectpicker();  
               $timeout(function(){
                  $('.select-picker').selectpicker('refresh'); 
                  $(".select-picker").on('click',function(){ 
                    $(this).toggleClass('open');
                 }); 
               },1000);   
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };
         
         /*
          * Get districts by county id 
          */
         $scope.getDistrictByCountyId = function(){
           $scope.districtsList = [];
            if(!$scope.county_id){ 
              refreshSelectPicker();
               return false;
            }
             var id = [$scope.county_id];
             DashboardService.getDistrictsByCountyIds({county_id:id})
            .then(function(response) {
                if(response.data.success){
                  $scope.districtsList = response.data.data;
                }
                 refreshSelectPicker();                  
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };
        

         /*
          * Get schools detail by district id
          */
         $scope.getSchoolesByDistId = function(){
            $scope.schoolesList = [];
            if(!$scope.district_id.length){
               refreshSelectPicker();
               return false;
            }
             DashboardService.getSchoolesByDistrictIds({district_id:$scope.district_id})
            .then(function(response) {
                if(response.data.success){ 
                  $scope.schoolesList = response.data.data;
                }
                refreshSelectPicker();                 
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };

         $scope.saveCountyReport = function(){
          var yearObj = UtilityService.convertAssessmentYear($scope.detailedReportYear);
          if($scope.multiFilterReport=='Teacher'){ 
            if($scope.filterForm.$valid){
              var data = {'county_id':$scope.county_id,
                      'district_id':($scope.district_id) ? $scope.district_id : [],
                      'school_id':($scope.school_id) ? $scope.school_id : [],
                      'file_name':'KRS_Teachers_Report',
                      'current_date':moment().format("MMMM DD, YYYY"),
                      'year':$scope.detailedReportYear,
                      'from_date':yearObj.from_date,
                      'to_date':yearObj.to_date};
            $scope.multiReportBtn = true;
            DashboardService.countyTeacherPdfReport(data)
            .then(function(response) {
                  $scope.multiReportBtn = false; 
                  $('#countyFilterFormPopup').modal('hide');
                 if(response.data.success){
                     window.open(appConstant.baseUrl + 'uploads/' + response.data.data.pdf);
                    }
                       
            }, function(error) {
               $scope.multiReportBtn = false;
               UtilityService.showToast('error','Something went wrong.');
            });
           }
          }
          if($scope.multiFilterReport=='Student'){

             if($scope.filterForm.$valid){
                var data = {'county_id':$scope.county_id,
                      'district_id':($scope.district_id) ? $scope.district_id : [],
                      'school_id':($scope.school_id) ? $scope.school_id : [],
                      'file_name':'KRS_Students_Report',
                      'current_date':moment().format("MMMM DD, YYYY"),
                      'year':$scope.detailedReportYear,
                      'from_date':yearObj.from_date,
                      'to_date':yearObj.to_date};
                $scope.multiReportBtn = true;
                DashboardService.countyStudentPdfReport(data)
                .then(function(response) {
                      $scope.multiReportBtn = false; 
                      $('#countyFilterFormPopup').modal('hide');
                     if(response.data.success){
                         window.open(appConstant.baseUrl + 'uploads/' + response.data.data.pdf);
                        }
                           
                }, function(error) {
                   $scope.multiReportBtn = false;
                   UtilityService.showToast('error','Something went wrong.');
                });
           }

          }
         };

         $scope.showDownloadTab = function(){
           $scope.dataDownloadReportYear = UtilityService.curentAssessmentYear();
           $scope.hideToolsLnk = true;
           $scope.downloadPage =true;
           $scope.toolsPage = false;
           $scope.allCountiesList();
           $scope.getAllStudents();
         };

         $scope.hideAndNullCountyChild = function(type){
           if(type=='county'){
            $scope.districtsHide = true;
            $scope.schoolesHide = true;
            $scope.teachersHide = true;
            $scope.teachersArr = [];
            $scope.districtAarr = [];
            $scope.schoolArr = [];
           }

           if(type=='district'){
              $scope.schoolesHide = true;
              $scope.teachersHide = true;
              $scope.teachersArr = [];
              $scope.schoolArr = [];
           }

           if(type=='school'){
              $scope.teachersHide = true;
              $scope.teachersArr = [];
           }
          return false;
         }

         $scope.allCountiesList = function(){
           var yearObj = UtilityService.convertAssessmentYear($scope.dataDownloadReportYear);
           
            $scope.countiesAarr = [];
            $scope.countiesIds =[];
            $scope.filterCountyLength = 0;
             DashboardService.getAllCounties({from_date:yearObj.from_date,to_date:yearObj.to_date})
             .then(function(response) {
                 if(response.data.success){
                     $scope.filterCountyLength = response.data.data.length;
                     $scope.countiesAarr = response.data.data;
                     angular.forEach(response.data.data,function(data){
                      $scope.countiesIds.push(data._id);
                     });
                      if(!$scope.countiesAarr.length){
                      $scope.hideAndNullCountyChild('county');
                       }else{
                         $scope.allDistrictsByCounty($scope.countiesIds);
                       }
                 } 
                  
              }, function(error) {
                   //UtilityService.showToast('error','Something went wrong.');
              });
         };
         
         $scope.checkAllCheckBoxChecked = function(isType){          
           var countyLength = 0,
               districtLength = 0,
               schoolLength = 0,
               teacherLength = 0;
            // County Check and UnCheck condition   
           if(isType==='county'){
                $(".countyCls").each(function(e){           
                 var countyIsChecked  = $('#'+this.id).prop("checked");
                  if(countyIsChecked){
                     countyLength +=1;
                  }
                 });
                if(countyLength!==$scope.filterCountyLength){ 
                 $('#countyAllChk').prop("checked",false);
                }

                if(countyLength===$scope.filterCountyLength){ 
                 $('#countyAllChk').prop("checked",true);
                }
                 
           }
  
           // District Check and UnCheck condition  
           if(isType==='district'){
                $(".districtCls").each(function(e){           
                 var districtIsChecked  = $('#'+this.id).prop("checked");
                  if(districtIsChecked){
                     districtLength +=1;
                  }
                 });
                if(districtLength!==$scope.filterDistrictLength){ 
                 $('#districtAllChk').prop("checked",false);
                }

                if(districtLength===$scope.filterDistrictLength){ 
                 $('#districtAllChk').prop("checked",true);
                }                 
           } 
        
            // School Check and UnCheck condition  
            if(isType==='school'){
                $(".schoolCls").each(function(e){           
                 var schoolIsChecked  = $('#'+this.id).prop("checked");
                  if(schoolIsChecked){
                     schoolLength +=1;
                  }
                 });
                if(schoolLength!==$scope.filterSchoolLength){ 
                 $('#schoolesAllChk').prop("checked",false);
                }

                if(schoolLength===$scope.filterSchoolLength){ 
                 $('#schoolesAllChk').prop("checked",true);
                }                 
           } 

           // Teacher Check and UnCheck condition  
            if(isType==='teacher'){
                $(".teacherCls").each(function(e){           
                 var teacherIsChecked  = $('#'+this.id).prop("checked");
                  if(teacherIsChecked){
                     teacherLength +=1;
                  }
                 });
                if(teacherLength!==$scope.filterTeacherLength){ 
                 $('#teachersAllChk').prop("checked",false);
                }

                if(teacherLength===$scope.filterTeacherLength){ 
                 $('#teachersAllChk').prop("checked",true);
                }                 
           } 
         }

         $scope.allDistrictsByCounty = function(ids){
             var yearObj = UtilityService.convertAssessmentYear($scope.dataDownloadReportYear);
             $scope.districtAarr = [];
             $scope.districtIds =[];
             $scope.filterDistrictLength = 0;
             if(!ids){
              ids = [];
               $(".countyCls").each(function(e){   
               var countyIsChecked  = $('#'+this.id).prop("checked");               
                  if(countyIsChecked){
                    ids.push(this.id);
                  }
                 });

              
             }
    
             var data = {from_date:yearObj.from_date,to_date:yearObj.to_date,county_id:ids,filter:true};
             DashboardService.getDistrictsByCountyIds(data)
            .then(function(response) {
                if(response.data.success){
                  $scope.filterDistrictLength = response.data.data.length;
                  $scope.districtAarr = response.data.data;
                   angular.forEach(response.data.data,function(data){
                      $scope.districtIds.push(data._id);
                     });
                   if($scope.districtAarr.length){
                      $scope.districtsHide = false; 
                      $scope.allSchoolesByDistrict($scope.districtIds);
                      
                   }else{
                    $scope.hideAndNullCountyChild('district');
                   }
                }
                             
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };

          $scope.allSchoolesByDistrict = function(ids){
             var yearObj = UtilityService.convertAssessmentYear($scope.dataDownloadReportYear);
             $scope.schoolArr = [];
             $scope.schoolIds =[];
             $scope.filterSchoolLength = 0;
              if(!ids){
              ids = [];
               $(".districtCls").each(function(e){   
               var distIsChecked  = $('#'+this.id).prop("checked");               
                  if(distIsChecked){
                    ids.push(this.id);
                  }
                 });

              
             }

             var data = {from_date:yearObj.from_date,to_date:yearObj.to_date,district_id:ids};
             DashboardService.getSchoolesByDistrictIds(data)
            .then(function(response) {
                if(response.data.success){ 
                  $scope.filterSchoolLength = response.data.data.length;
                  $scope.schoolArr = response.data.data;
                   angular.forEach(response.data.data,function(data){
                      $scope.schoolIds.push(data._id);
                     });
                    if($scope.schoolArr.length){
                        $scope.schoolesHide = false; 
                        $scope.allTeachersBySchool($scope.schoolIds);
                       }else{
                        $scope.hideAndNullCountyChild('district');
                       } 
                }
                            
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };

          $scope.allTeachersBySchool = function(ids){
             var yearObj = UtilityService.convertAssessmentYear($scope.dataDownloadReportYear);
             $scope.teachersArr = [];
             $scope.teacherIds =[];
             $scope.filterTeacherLength = 0;
              if(!ids){
              ids = [];
               $(".schoolCls").each(function(e){   
               var schoolIsChecked  = $('#'+this.id).prop("checked");   
                   if(schoolIsChecked){
                    ids.push(this.id);
                  }
                 });
 
             }
             var data = {from_date:yearObj.from_date,to_date:yearObj.to_date,school_id:ids};
             DashboardService.getTeachersBySchoolIds(data)
            .then(function(response) {
                if(response.data.success){ 
                  $scope.filterTeacherLength = response.data.data.length;
                  $scope.teachersArr = response.data.data;
                   angular.forEach(response.data.data,function(data){
                      $scope.teacherIds.push(data._id);
                     }); 
                   if($scope.teachersArr.length){
                     $scope.teachersHide = false; 
                   }else{
                     $scope.teachersHide = true;
                   }
                 
                }
                            
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
         };


         $scope.getAllStudents = function(filter){
          var yearObj = UtilityService.convertAssessmentYear($scope.dataDownloadReportYear);
          $scope.studentsArr =[];
          $scope.studentReportData.data = [];
          $scope.studentsListLoader = true;
          var data = {};
          if(filter){
             data = filter;
          }else{
            data = {cid:[],did:[],sid:[],tid:[]};
          }
            data.from_date=yearObj.from_date;
            data.to_date=yearObj.to_date;
            UtilityService.reinitializeTable('studentListTable');
            DashboardService.getAllStudents(data)
            .then(function(response) {
                if(response.data.success){
                  //$scope.studentsArr = response.data.data.students;
                  angular.forEach(response.data.data.students,function(result){
                    var teacherDetail = response.data.data.teachers.filter(function(obj){
                        return obj._id.toString() == result.teacherId.toString();
                    });
                    result.teacher_name = (teacherDetail.length) ? teacherDetail[0].firstName+' '+teacherDetail[0].lastName : '-';
                    $scope.studentsArr.push(result);
                     $scope.studentReportData.data.push({
                       'First Name': result.firstName,
                       'Last Name': result.lastName,
                       'Created': new Date(result.created).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                       'Gender': result.gender,
                       'DOB': result.dob, 
                       'First Language': result.firstLanguage, 
                       'IEP': result.iep,
                       'Pre-School' : result.preSchool,
                       'Transitional' : result.transitionalKindergarten,
                       'Teacher Name' : (teacherDetail.length) ? teacherDetail[0].firstName+' '+teacherDetail[0].lastName : '-'
                    });
                  });
                UtilityService.initializeDataTable('studentListTable',{ orderable: false, targets: [] });
                   
                }
                  $scope.studentsListLoader = false;           
            }, function(error) {
               $scope.studentsListLoader = false;
                 //UtilityService.showToast('error','Something went wrong.');
            });
         }

 

       $scope.exportDownloadPageCsv = function(){
            $scope.disableExportBtn = false;
            $scope.studentReportData.file_name = 'KRS_Students'
             DashboardService.exportReport($scope.studentReportData)
               .then(function(response) {
                   if(response.data.success){
                     window.open(appConstant.baseUrl + 'uploads/' + response.data.data.csv);
                    }
                   $scope.disableExportBtn = false;
                }, function(error) {
                   $scope.disableExportBtn = false;
                     UtilityService.showToast('error','Something went wrong.');
                });
       };

       $scope.filterResult = function(){
        var data = {cid:[],did:[],sid:[],tid:[]}; 
          $(".countyCls").each(function(e){           
           var countyIsChecked  = $('#'+this.id).prop("checked");
               
            if(countyIsChecked){
              data.cid.push(this.id);
            }
           });

           $(".districtCls").each(function(e){           
           var distIsChecked  = $('#'+this.id).prop("checked");
             if(distIsChecked){
              data.did.push(this.id);
            }
           });

          $(".schoolCls").each(function(e){           
           var schoolIsChecked  = $('#'+this.id).prop("checked");
             if(schoolIsChecked){
              data.sid.push(this.id);
            }
           });

          $(".teacherCls").each(function(e){           
           var teacherIsChecked  = $('#'+this.id).prop("checked");
             if(teacherIsChecked){
               data.tid.push(this.id);
            }
           });

          if(!data.tid.length){
              $scope.studentsArr =[];
              $scope.studentReportData.data = [];
              UtilityService.reinitializeTable('studentListTable');
              $timeout(function(){
                 UtilityService.initializeDataTable('studentListTable',{ orderable: false, targets: [] });
              },1000);
             
              return false;
          }
          
  
          $scope.getAllStudents(data);
         
       };

       $scope.countyAllCheck = function(isChecked){
         if(!isChecked){
         $scope.hideAndNullCountyChild('county')
          $('.countyCls').prop("checked",false);
        }else{
          $('.countyCls').prop("checked",true);
           $scope.allDistrictsByCounty(false);
        }
       };

        $scope.districtAllCheck = function(isChecked){ 
         if(!isChecked){
          $scope.hideAndNullCountyChild('district')
          $('.districtCls').prop("checked",false)
        }else{
           $('.districtCls').prop("checked",true);
           $scope.allSchoolesByDistrict(false);
        }
       };

        $scope.schoolAllCheck = function(isChecked){ 
         if(!isChecked){
          $scope.hideAndNullCountyChild('school')
           $('.schoolCls').prop("checked",false)
        }else{
           $('.schoolCls').prop("checked",true);
           $scope.allTeachersBySchool(false);
        }
       };

        $scope.teacherAllCheck = function(isChecked){ 
         if(!isChecked){
            $('.teacherCls').prop("checked",false)
        }else{
           $('.teacherCls').prop("checked",true);
          }
       };


       /*
       * Export Thirs County report
       */
       $scope.exportThirdReport = function(){
          $scope.thirdPdfLoader = true;
          var yearObj = UtilityService.convertAssessmentYear($scope.detailedReportYear);
           var data = {'file_name':'County_District_School_Report',
                      'current_date':moment().format("MMMM DD, YYYY"),
                      'year':$scope.detailedReportYear,
                      'from_date':yearObj.from_date,
                      'to_date':yearObj.to_date};
               DashboardService.exportThirdReport(data)
               .then(function(response) {
                   if(response.data.success){
                     window.open(appConstant.baseUrl + 'uploads/' + response.data.data.pdf);
                    }
                   $scope.thirdPdfLoader = false;
                }, function(error) {
                   $scope.thirdPdfLoader = false;
                     UtilityService.showToast('error','Something went wrong.');
                });
       };
     
      /*
       * Export Thirs County report
       */
       $scope.exportFourthReport = function(){
          $scope.fourthPdfLoader = true;
          var yearObj = UtilityService.convertAssessmentYear($scope.detailedReportYear);
          var data = {'file_name':'KRS_County_Report',
                      'current_date':moment().format("MMMM DD, YYYY"),
                      'year':$scope.detailedReportYear,
                      'from_date':yearObj.from_date,
                      'to_date':yearObj.to_date};
               DashboardService.exportFourthReport(data)
               .then(function(response) {
                   if(response.data.success){
                     window.open(appConstant.baseUrl + 'uploads/' + response.data.data.pdf);
                    }
                   $scope.fourthPdfLoader = false;
                }, function(error) {
                   $scope.fourthPdfLoader = false;
                     UtilityService.showToast('error','Something went wrong.');
                });
       };

       $scope.getLiteracyNumeracyAndSocial = function(){ 
            var yearObj = UtilityService.convertAssessmentYear($scope.toolsPageReportYear);
             $scope.literacyNumeSocialArr = [];
             $scope.dashboardToolsLoader = true;
             $scope.downloadPage = false;
             $scope.toolsPage = true;
             $scope.hideToolsLnk = true;
             var data = {'year':$scope.toolsPageReportYear,
                      'from_date':yearObj.from_date,
                      'to_date':yearObj.to_date};
            DashboardService.getLiteracyNumeracyAndSocial(data)
               .then(function(response) {
                   if(response.data.success){
                     $scope.literacyNumeSocialArr = response.data.data;
                     $scope.getDashboardTools();
                    }
                 }, function(error) {
                      UtilityService.showToast('error','Something went wrong.');
                });
       };

       $scope.getDashboardTools = function(){
           $scope.studentsArr =[];
           $scope.studentReportData.data = [];
           $scope.dashboardTools = [];
            
           $scope.greenYelloRedReport = [];
           $scope.greenYellowRedListLoader = true;
           DashboardService.getDashboardTools({})
               .then(function(response) {
                   if(response.data.success){
                     angular.forEach(response.data.data,function(result,countyKey){
                        $scope.dashboardTools.push(result); 
                        var countyAvg = [];
                        var countyLiteracyPoorAvgPercent = 0;
                        var countyLiteracyGoodAvgPercent = 0;
                        var countyLiteracyVeryGoodAvgPercent = 0;
                        var countyNumeracyPoorAvgPercent = 0;
                        var countyNumeracyGoodAvgPercent = 0;
                        var countyNumeracyVeryGoodAvgPercent = 0;
                        var countySocialPoorAvgPercent = 0;
                        var countySocialGoodAvgPercent = 0;
                        var countySocialVeryGoodAvgPercent = 0;
                        var distCount = 1;
                        angular.forEach(result.district_new,function(distResult,distKey){
                          var literacyPoorAvgPercent = 0;
                          var literacyGoodAvgPercent = 0;
                          var literacyVeryGoodAvgPercent = 0;
                          var numeracyPoorAvgPercent = 0;
                          var numeracyGoodAvgPercent = 0;
                          var numeracyVeryGoodAvgPercent = 0;
                          var socialPoorAvgPercent = 0;
                          var socialGoodAvgPercent = 0;
                          var socialVeryGoodAvgPercent = 0;
                          var count = 1;
                          var districtAvg = [];
                            angular.forEach(distResult.schools_new,function(schoolResult,schoolKey){
                               
                               /*
                                * Literacy calculation
                                */ 
                                  var literacyPoorNumRecord =  $scope.literacyNumeSocialArr.literacy.filter(function(obj){
                                         return  schoolResult._id.toString()==obj.schoolId.toString() && obj.score <= litPoor;
                                  });
                                  var literacyPoorPercent = (literacyPoorNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                  literacyPoorPercent = literacyPoorPercent.toFixed(2);
                                  
                                  var literacyGoodNumRecord =  $scope.literacyNumeSocialArr.literacy.filter(function(obj){
                                         return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > litPoor && obj.score <= litGood;
                                  });
                                  var literacyGoodPercent = (literacyGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                  literacyGoodPercent = literacyGoodPercent.toFixed(2);


                                  var literacyVeryGoodNumRecord =  $scope.literacyNumeSocialArr.literacy.filter(function(obj){
                                         return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > litGood;
                                  });
                                  var literacyVeryGoodPercent = (literacyVeryGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                literacyVeryGoodPercent = literacyVeryGoodPercent.toFixed(2);
                                /*
                                * Calculate District Poor Avg percentage
                                */
                                literacyPoorAvgPercent +=parseFloat(literacyPoorPercent); 
                                literacyGoodAvgPercent += parseFloat(literacyGoodPercent);  
                                literacyVeryGoodAvgPercent += parseFloat(literacyVeryGoodPercent); 

                                



                               $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].literacy_poor = literacyPoorPercent; 
                               $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].literacy_good = literacyGoodPercent;
                               $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].literacy_very_good = literacyVeryGoodPercent;
                              
                              
                              
                               /* 
                                * Numeracy calculation 
                                */
                                var numeracyPoorNumRecord =  $scope.literacyNumeSocialArr.numeracy.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score <= numePoor;
                                });
                                 var numeracyPoorPercent = (numeracyPoorNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                numeracyPoorPercent = numeracyPoorPercent.toFixed(2);


                                 var numeracyGoodNumRecord =  $scope.literacyNumeSocialArr.numeracy.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > numePoor && obj.score <= numeGood;
                                });
                                 var numeracyGoodPercent = (numeracyGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                numeracyGoodPercent = numeracyGoodPercent.toFixed(2);


                                var numeracyVeryGoodNumRecord =  $scope.literacyNumeSocialArr.numeracy.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > numeGood;
                                });
                                 var numeracyVeryGoodPercent = (numeracyVeryGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                numeracyVeryGoodPercent = numeracyVeryGoodPercent.toFixed(2);
                             

                                /*
                                * Calculate District Good Avg percentage
                                */
                                 numeracyPoorAvgPercent +=parseFloat(numeracyPoorPercent); 
                                 numeracyGoodAvgPercent += parseFloat(numeracyGoodPercent); 
                                 numeracyVeryGoodAvgPercent +=parseFloat(numeracyVeryGoodPercent); 


                              $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].numeracy_poor = numeracyPoorPercent; 
                              $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].numeracy_good = numeracyGoodPercent;
                              $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].numeracy_very_good = numeracyVeryGoodPercent;
                              
                               /* 
                                * Social calculation 
                                */
                                var socialPoorNumRecord =  $scope.literacyNumeSocialArr.social.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score <= socPoor;
                                });
                                 var socialPoorPercent = (socialPoorNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                socialPoorPercent = socialPoorPercent.toFixed(2);


                                 var socialGoodNumRecord =  $scope.literacyNumeSocialArr.social.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > socPoor && obj.score <= socGood;
                                });
                                 var socialGoodPercent = (socialGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                socialGoodPercent = socialGoodPercent.toFixed(2);


                                var socialVeryGoodNumRecord =  $scope.literacyNumeSocialArr.social.filter(function(obj){
                                       return schoolResult._id.toString()==obj.schoolId.toString() && obj.score > socGood;
                                });
                                 var socialVeryGoodPercent = (socialVeryGoodNumRecord.length/$scope.literacyNumeSocialArr.students)*100;
                                socialVeryGoodPercent = socialVeryGoodPercent.toFixed(2);
                              

                                /*
                                 * Social Very Good Avg percentage
                                 */
                                 socialPoorAvgPercent  +=parseFloat(socialPoorPercent); 
                                 socialGoodAvgPercent +=parseFloat(socialGoodPercent); 
                                 socialVeryGoodAvgPercent +=parseFloat(socialVeryGoodPercent);


                                $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].social_poor = socialPoorPercent; 
                                $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].social_good = socialGoodPercent;
                                $scope.dashboardTools[countyKey].district_new[distKey].schools_new[schoolKey].social_very_good = socialVeryGoodPercent;
                                districtAvg =[]; 
                                if(count==distResult.schools_new.length){ 
                                    
                                   districtAvg.push({'literacyPoor':(literacyPoorAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'literacyGood' :(literacyGoodAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'literacyVeryGood':(literacyVeryGoodAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'numeracyPoor':(numeracyPoorAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'numeracyGood' :(numeracyGoodAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'numeracyVeryGood':(numeracyVeryGoodAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'socialPoor':(socialPoorAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'socialGood' :(socialGoodAvgPercent/distResult.schools_new.length).toFixed(2),
                                                     'socialVeryGood':(socialVeryGoodAvgPercent/distResult.schools_new.length).toFixed(2) });
                                                 
                                    countyLiteracyPoorAvgPercent += (literacyPoorAvgPercent/distResult.schools_new.length);  
                                    countyLiteracyGoodAvgPercent += (literacyGoodAvgPercent/distResult.schools_new.length);  
                                    countyLiteracyVeryGoodAvgPercent += (literacyVeryGoodAvgPercent/distResult.schools_new.length);  
                                    countyNumeracyPoorAvgPercent += (numeracyPoorAvgPercent/distResult.schools_new.length);  
                                    countyNumeracyGoodAvgPercent += (numeracyGoodAvgPercent/distResult.schools_new.length);  
                                    countyNumeracyVeryGoodAvgPercent += (numeracyVeryGoodAvgPercent/distResult.schools_new.length);  
                                    countySocialPoorAvgPercent += (socialPoorAvgPercent/distResult.schools_new.length);  
                                    countySocialGoodAvgPercent += (socialGoodAvgPercent/distResult.schools_new.length);  
                                    countySocialVeryGoodAvgPercent += (socialVeryGoodAvgPercent/distResult.schools_new.length);  
                                } 

                                $scope.dashboardTools[countyKey].district_new[distKey].districtAvg = districtAvg;
//                                $scope.greenYelloRedReport.push({'county':result.name,
//                                                                    'district':distResult.name, 
//                                                                    'school':schoolResult.name, 
//                                                                    'literacy_red_yellow_green': literacyPoorPercent+'% '+literacyGoodPercent+'% '+literacyVeryGoodPercent+'%',
//                                                                    'numeracy_red_yellow_green': numeracyPoorPercent+'% '+numeracyGoodPercent+'% '+numeracyVeryGoodPercent+'%', 
//                                                                    'socphyemo_red_yellow_green': socialPoorPercent+'% '+socialGoodPercent+'% '+socialVeryGoodPercent+'%',
//                                                                    'district_average':districtAvg,
//                                                                    'county_average':0
//                                                                     });
                                count++;
                            
                            
                            }); 
                           
                            if(distCount==result.district_new.length){
                                countyAvg.push({countyLiteracyPoorAvgPercent: (countyLiteracyPoorAvgPercent/result.district_new.length).toFixed(2),
                                countyLiteracyGoodAvgPercent: (countyLiteracyGoodAvgPercent/result.district_new.length).toFixed(2),
                                countyLiteracyVeryGoodAvgPercent: (countyLiteracyVeryGoodAvgPercent/result.district_new.length).toFixed(2),
                                countyNumeracyPoorAvgPercent: (countyNumeracyPoorAvgPercent/result.district_new.length).toFixed(2),
                                countyNumeracyGoodAvgPercent: (countyNumeracyGoodAvgPercent/result.district_new.length).toFixed(2),
                                countyNumeracyVeryGoodAvgPercent: (countyNumeracyVeryGoodAvgPercent/result.district_new.length).toFixed(2),
                                countySocialPoorAvgPercent: (countySocialPoorAvgPercent/result.district_new.length).toFixed(2),
                                countySocialGoodAvgPercent: (countySocialGoodAvgPercent/result.district_new.length).toFixed(2),
                                countySocialVeryGoodAvgPercent: (countySocialVeryGoodAvgPercent/result.district_new.length).toFixed(2),});
                                
                            }
                            $scope.dashboardTools[countyKey].countyAvg = countyAvg;
                            distCount++;
                             
                           
                        }); 
                        
                        
                       
                     });
                     
                    }
                   
                   $scope.dashboardToolsLoader = false;
                   $scope.greenYellowRedListLoader = false;
                }, function(error) {
                   $scope.dashboardToolsLoader = false;
                   $scope.greenYellowRedListLoader = false;
                     UtilityService.showToast('error','Something went wrong.');
           });
       };
       
       
       
       $scope.exportsGreenYelloRedPdf = function(){
              $scope.disableToolPageExportBtn = false; 
              console.log($scope.dashboardTools);
              var data ={data: angular.copy($scope.dashboardTools),
                       year: $scope.yearDropDown,
                       file_name: 'KRS_County_School_Report',
                       'current_date':moment().format("MMMM DD, YYYY")};
              DashboardService.exportGreenYelloRedPdfReport(data)
                .then(function(response) {
                    if(response.data.success){
                        window.open(appConstant.baseUrl + 'uploads/' + response.data.data.pdf);
                     }
                    $scope.disableToolPageExportBtn = false;
                 }, function(error) {
                    $scope.disableToolPageExportBtn = false;
                      UtilityService.showToast('error','Something went wrong.');
                 });
       };
       
       $scope.openEmailModalPopup = function(color, type, percent, county_id, district_id, school_id, county_name, district_name, school_name,percentage){
            $scope.studentsReportData = [];
              
               // if(percent<=0){
               //     return false;
               // }
 
           var data ={color:color,type:type,percent:percent,
                      literacyPoor:litPoor,
                      literacyGood:litGood,
                      literacyVeryGood:litVeryGood,
                      numeracyPoor:numePoor,
                      numeracyGood:numeGood,
                      numeracyVeryGood:numeVeryGood,
                      socialPoor:socPoor,
                      socialGood:socGood,
                      socialVeryGood:socVeryGood,
                      county_id:county_id,
                      district_id:district_id,
                      school_id:school_id};
                  
              $scope.emailForm = angular.copy(DashboardService.emailForm);
              $scope.emailSendFrm.$setPristine();
              $scope.emailSendFrm.$setUntouched();
             DashboardService.getSchoolStudentsByPercentage(data)
                .then(function(response) {
                    if(response.data.success){
                      var assessment_type= '';
                       if(type==='literacy'){
                         assessment_type = 'Literacy';
                       }else if(type==='numeracy'){
                          assessment_type = 'Numeracy';
                       }else if(type==='social'){
                           assessment_type = 'Soc-Phy-Emo';
                       } 
                       $scope.studentResult = response.data.data.sort(function(a, b) {
                                var textA = a.student.firstName.toUpperCase();
                                var textB = b.student.firstName.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                       angular.forEach($scope.studentResult,function(result){
                           result.teacher_name = (result.teacher) ? result.teacher.firstName+' '+result.teacher.lastName : '-';
                           result.teacher_email = (result.teacher) ? result.teacher.email : '-';
                           result.student_first_name = (result.student) ? result.student.firstName : '-';
                           result.student_last_name = (result.student) ? result.student.lastName : '-';
                           result.student_email = (result.student) ? result.student.email : '-';
                           $scope.studentsReportData.push(result);
                       });  
                        $scope.emailHtml(county_name,district_name,school_name,$scope.studentsReportData,assessment_type, color, percentage);//html for email
                        $scope.emailForm.subject = color+' Lights Report - List of Students';
                        $scope.emailForm.email_county_name = county_name;
                        $scope.emailForm.email_district_name = district_name;
                        $scope.emailForm.email_school_name = school_name;
                        $scope.emailForm.assessment_type = assessment_type;
                        $scope.emailForm.color = color;
                        $scope.emailForm.percentage = percentage;
                        
                        $('#emailModelPopup').modal('show');
                     }
                  }, function(error) {
                       UtilityService.showToast('error','Something went wrong.');
                 });
          
       };
       
       
       $scope.emailHtml = function(county_name,district_name,school_name,data,assessment_type,color,percent){
           emailReportHtml = '';
            emailReportHtml += '<div>'+
                              '<p>This is the list of students that scored '+percent+'% '+color+' in the '+assessment_type+' assessment.</p>'+
                              '<ul>'+
                                   '<li>County: '+county_name+'</li>'+
                                   '<li>District: '+district_name+'</li>'+
                                   '<li>School: '+school_name+'</li>'+
                               '</ul>'+
                               ' <table class="table">'+
                                    '<thead>'+
                                      '<tr>'+
                                        '<th>First Name</th>'+
                                        '<th>Last Name</th>'+
                                        '<th>Teacher Email</th>'+
                                        '<th>Teacher</th>'+
                                      '</tr>'+
                                    '</thead>'+
                                    '<tbody>';
                            angular.forEach(data,function(result){
                                emailReportHtml +='<tr>'+
                                    '<td>'+result.student_first_name+'</td>'+
                                    '<td>'+result.student_last_name+'</td>'+
                                    '<td>'+result.teacher_email+'</td>'+
                                    '<td>'+result.teacher_name+'</td>'+
                                '</tr>'; 
                            });

                            if(!data.length){
                                emailReportHtml +='<tr>'+
                                    '<td colspan="4">No Record Found.</td>'+
                                    '</tr>'; 
                            }
                            
                                emailReportHtml +='<tbody></table>'+
                              '</div>';
                      
                      $scope.emailForm.html = emailReportHtml;
                        
       };
       
       
       $scope.sendStudentsToolsReportByEmail = function(){
            if($scope.emailSendFrm.$valid){
               $scope.emailSendBtn = true;
                DashboardService.sendStudentsReportByEmail($scope.emailForm)
                     .then(function(response) {
                         if(response.data.success){
                              UtilityService.showToast('success','Email Successfully Sent.');
                             $('#emailModelPopup').modal('hide');
                          }else{
                              UtilityService.showToast('error','Something went wrong.');
                          }
                          $scope.emailSendBtn = false;
                       }, function(error) {
                          $scope.emailSendBtn = false;
                            UtilityService.showToast('error','Something went wrong.');
                      });
             }
       };

       $scope.resetToolLink = function(){
             $scope.toolsPage = false;
             $scope.downloadPage = false;
             $scope.hideToolsLnk = false;
             $scope.dashboardTools = [];
       };

       $scope.getCountiesDistrictsAndSchools = function(){
              var yearObj = UtilityService.convertAssessmentYear($scope.dashboardYear);
              var data = {year:$scope.dashboardYear,from_date:yearObj.from_date,to_date:yearObj.to_date};
                DashboardService.getCountyDistrictsAndSchools(data)
                     .then(function(response) { 
                         if(response.data.success){
                           $scope.total_schooles = response.data.data.schooles;
                           $scope.total_counties = response.data.data.counties;
                           $scope.total_districts = response.data.data.districts;
                          }
                       }, function(error) {
                            UtilityService.showToast('error','Something went wrong.');
                      });
       };

      $timeout(function(){
         $scope.getCountiesDistrictsAndSchools(); 
      },2000);
      
 
    }]);
})();