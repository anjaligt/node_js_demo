!(function(){

	angular.module('firstFiveApp').controller('ManagementController',['$scope','$state','$ngBootbox','$stateParams','$filter','$timeout','UtilityService','ManagementService',function($scope,$state,$ngBootbox, $stateParams, $filter, $timeout ,UtilityService,ManagementService){
    $scope.alphabetArr = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]    
     $scope.districtsList = [];
     $scope.noDistrictFound = true;
     $scope.distListErrorMsg = ' Please select keyword.';
     $scope.selectedKeyWord = '';
     $scope.countyCount = 0;
     $scope.countyObj = {};
     $scope.countyDistrictList = [];
     $scope.countyDistrictCount = 0;
     $scope.counties = [];
     $scope.districtObj = {};
     $scope.schoolsCount = 0;
     $scope.schoolList = [];
     $scope.districts = [];
     $scope.teachersList =[];
     $scope.allTeachersEmails = [];
     $scope.teacherEmails = [];
     $scope.schoolObj = {};
     $scope.teacherPin = '';
     $scope.appSettingsObj = {};
     $scope.pinBtnDisables = true;
     $scope.disableEmailSelectBox = true;
     $scope.teacherEmailForm = angular.copy(ManagementService.teacherEmailForm);
     $scope.countyId = '';
     $scope.districtId = '';
     $scope.schoolId='';
     $scope.appStatus = '';
      $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
   $scope.changeTab = function(id){
    $(".tab-class").removeClass('active');
    $(".tab-class").removeClass('in');
    $("#"+id).addClass('in');
    $("#"+id).addClass('active');
   }
   

   $scope.openCountyForm  = function(){
    $scope.countyAddBtn = true;
    $scope.countyUpdateBtn = false;
    $scope.countyName = '';
    $scope.countyForm.$setPristine();
    $scope.countyForm.$setUntouched();
    $("#addCounty").modal('show');
   }


   $scope.getCountyCount = function(keyword){
      $scope.selectedKeyWord = keyword;
        ManagementService.getCountyCount({keyword:keyword})
           .then(function(response) {
              if(response.data.success){
                 $scope.countyCount = response.data.data;
               
               }
          
            }, function(error) {
                 UtilityService.showToast('error','Something went wrong.');
            });
   }
 
   if($state.current.name=='admin.management'){
    $scope.getCountyCount();
   }

   $scope.resetAlphabetHighLight = function(){
      $(".alphabetCls").removeClass('active-alphabet');
      $scope.getDistrictByName();
   };

   $scope.getDistrictByName = function(keyword,isClick,index){
    $(".alphabetCls").removeClass('active-alphabet');
    if(isClick){
      $("#alphabet_"+index).addClass('active-alphabet');
    } 
    $scope.districtsList =[];
      $scope.selectedKeyWord = keyword;
       $scope.countyListLoader = true;
       UtilityService.reinitializeTable('countyListTable');
        ManagementService.getDistrictByName({keyword:keyword})
           .then(function(response) {
            if(response.status==200){

               $scope.districtsList = response.data.results.counties;
                 UtilityService.initializeDataTable('countyListTable',{ orderable: false, targets: [1,2] });
                 
               
            }else{
                 UtilityService.showToast('error','Something went wrong.');
            }
             $scope.countyListLoader = false;
            }, function(error) {
               $scope.countyListLoader = false;
                 //UtilityService.showToast('error','Something went wrong.');
            });
   }
    if($state.current.name=='admin.management'){
     $scope.getDistrictByName();
   }

   $scope.deleteCounty = function(){
     if($scope.confirmCountyDelete.toLowerCase()==='yes'){
        $scope.deleteContyBtn = true;
          ManagementService.deleteCountyById({id: $scope.countyId})
           .then(function(response) {
                if(response.status==200){
                  UtilityService.showToast('success','County successfully deleted.');
                  $scope.getDistrictByName($scope.selectedKeyWord);
                  $("#deleteCountyModalPopup").modal('hide');
                }else{
                   UtilityService.showToast('error','Something went wrong.');
               }
                 $scope.deleteContyBtn = false;
            }, function(error) {
               $scope.deleteContyBtn = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
      }    
          
   };

   $scope.saveCounty = function(){
    if($scope.countyForm.$valid){
       $scope.countySaveBtn = true;
       ManagementService.addCounty({countyname:$scope.countyName})
         .then(function(response) {
              if(response.data.success){
                  $scope.countyName = '';
                  $scope.countyForm.$setPristine();
                  $scope.countyForm.$setUntouched();
                  $("#addCounty").modal('hide');
                 UtilityService.showToast('success','County successfully added.');
                 $scope.getDistrictByName();
               }else{
                 UtilityService.showToast('error',(((response.data.message.length) ? response.data.message[0].message : 'Something went wrong.')));
             }
              $scope.countySaveBtn = false;
              }, function(error) {
                 $scope.countySaveBtn = false;
                  UtilityService.showToast('error','Something went wrong.');
              });
                         
                
    }
   }

   /*Edit county*/
   $scope.editCounty = function(index){
     $scope.countyObj = angular.copy($scope.districtsList[index]);
     $scope.countyName = $scope.countyObj.name;
     $scope.countyAddBtn = false;
     $scope.countyUpdateBtn = true;
     $("#addCounty").modal('show');
   };

   /*Update conuty*/
   $scope.updateCounty = function(){
      $scope.countySaveBtn = true;
       ManagementService.updateCounty({countyname:$scope.countyName,id:$scope.countyObj._id})
             .then(function(response) {
                  if(response.data.success){
                      $scope.countyName = '';
                      $scope.countyForm.$setPristine();
                      $scope.countyForm.$setUntouched();
                      $("#addCounty").modal('hide');
                       $scope.getDistrictByName($scope.selectedKeyWord);
                     UtilityService.showToast('success','County successfully update.');
                   }else{
                      UtilityService.showToast('error','County name already exist.');
                }
                $scope.countySaveBtn = false;
                }, function(error) {
                   $scope.countySaveBtn = false;
                    UtilityService.showToast('error','Something went wrong.');
                });
   };


   $scope.getDistrictsByCountyId = function(){
       $scope.districtListLoader = true;
        UtilityService.reinitializeTable('districtListTable');
        ManagementService.getDistrictsByCountyId({id:$stateParams.id})
           .then(function(response) {
            if(response.data.success){ 
              
              var countyDetail = response.data.data.counties.filter(function(obj){
                  return $stateParams.id == obj._id;
              });
             
              if(countyDetail.length){
                $scope.districtCountyName = countyDetail[0]['name']+' /';
              }
               $scope.countyDistrictList = response.data.data.county_districts;
               $scope.countyDistrictCount = response.data.data.districts_count;
               $scope.counties = response.data.data.counties;
               UtilityService.initializeDataTable('districtListTable',{ orderable: false, targets: [1,2] });
               if(!$scope.countyDistrictList.length){
                 $scope.noRecordsFound = true;
               }else{
                 $scope.noRecordsFound = false;
               }
            }else{
                 UtilityService.showToast('error','Something went wrong.');
            }
             $scope.districtListLoader = false;
            }, function(error) {
                 $scope.districtListLoader = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
   };

 
   if($state.current.name=='admin.managementDestrict'){
      $scope.getDistrictsByCountyId();
   }


   /*Open district form*/
   $scope.addDistrictForm = function(){
    $scope.formTitle = 'Add New District';
    $scope.districtAddBtn = true;
    $scope.districtUpdateBtn = false;
    $scope.countyFiled = true;
    $scope.e1 = $stateParams.id;
    $scope.districtName = '';
    $scope.districtForm.$setPristine();
    $scope.districtForm.$setUntouched();
     $('#addDistrictForm').modal('show');
   }

   $scope.saveDistrict = function(){
      if($scope.districtForm.$valid){
         $scope.districtSaveBtn = true;
         ManagementService.addDistrict({districtName:$scope.districtName,e1:$scope.e1})
             .then(function(response) {
                  if(response.data.success){
                      $scope.districtName = '';
                      $scope.e1 = '';
                      $scope.districtForm.$setPristine();
                      $scope.districtForm.$setUntouched();
                      $("#addDistrictForm").modal('hide');
                      $scope.getDistrictsByCountyId();
                     UtilityService.showToast('success','District added successfully.');
                   }else{
                      UtilityService.showToast('error','District name already exist.');
                }
                $scope.districtSaveBtn = false;
                }, function(error) {
                   $scope.districtSaveBtn = false;
                    UtilityService.showToast('error','Something went wrong.');
                });
      }
   };



    $scope.deleteDistrict = function(){
       if($scope.confirmDistrictDelete.toLowerCase()==='yes'){
          $scope.deleteDistrictBtn = true;
          ManagementService.deleteDistrictById({id:$scope.districtId})
           .then(function(response) {
                if(response.status==200){
                   $("#deleteDistrictModalPopup").hide();
                  $('body').removeClass('modal-open');
                  $('.modal-backdrop').remove();
                 
                  UtilityService.showToast('success','District successfully deleted.');
                  $scope.getDistrictsByCountyId();
                  
                }else{
                   UtilityService.showToast('error','Something went wrong.');
               }
                $scope.deleteDistrictBtn = false;
            }, function(error) {
               $scope.deleteDistrictBtn = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
          }
          
   }

   $scope.editDistrict = function(index){
      $scope.districtObj = angular.copy($scope.countyDistrictList[index]);
      $scope.formTitle = 'Edit District';
      $scope.districtAddBtn = false;
      $scope.districtUpdateBtn = true;
      $scope.countyFiled = false;
      $scope.e1 = $scope.districtObj.countyId;
      $scope.districtName = $scope.districtObj.name;
      $scope.districtForm.$setPristine();
      $scope.districtForm.$setUntouched();
      $('#addDistrictForm').modal('show');
   }


   $scope.updateDistrict = function(){
      if($scope.districtForm.$valid){
         $scope.districtsUpdateBtn = true;
         ManagementService.updateDistrict({districtName:$scope.districtName,id:$scope.districtObj._id})
             .then(function(response) {
                  if(response.data.success){
                      $scope.districtName = '';
                      $scope.e1 = '';
                      $scope.districtForm.$setPristine();
                      $scope.districtForm.$setUntouched();
                      $("#addDistrictForm").modal('hide');
                      $scope.getDistrictsByCountyId();
                     UtilityService.showToast('success','District successfully update.');
                   }else{
                      UtilityService.showToast('error','District name already exist.');
                }
                $scope.districtsUpdateBtn = false;
                }, function(error) {
                   $scope.districtsUpdateBtn = false;
                    UtilityService.showToast('error','Something went wrong.');
                });
      }
   }

   $scope.getDistrictSchooles = function(){
       $scope.districtListLoader = true;
       $scope.schoolList =[];
        UtilityService.reinitializeTable('schoolesListTable');
        ManagementService.getDistrictSchooles({id:$stateParams.id})
           .then(function(response) {
            if(response.data.success){ 
               var districtDetail = response.data.data.districts.filter(function(obj){
                    return $stateParams.id == obj._id;
              });
             
              if(districtDetail.length){
                 $scope.districtSchoolName = districtDetail[0]['name']+' /';
              }
               $scope.schoolList = response.data.data.schooles;
               $scope.schoolsCount = response.data.data.schools_count;

               $scope.districts = response.data.data.districts.sort(function(a, b) {
                                var textA = a.name.toUpperCase();
                                var textB = b.name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
               //$scope.districts = response.data.data.districts;
               UtilityService.initializeDataTable('schoolesListTable',{ orderable: false, targets: [1] });
               if(!$scope.schoolList.length){
                 $scope.noRecordsFound = true;
               }else{
                 $scope.noRecordsFound = false;
               }
            }else{
                 UtilityService.showToast('error','Something went wrong.');
            }
             $scope.districtListLoader = false;
            }, function(error) {
                 $scope.districtListLoader = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
   };

  
   if($state.current.name=='admin.managementSchooles'){
      $scope.getDistrictSchooles();
   }


   $scope.deleteSchoole = function(){
        if($scope.confirmSchoolDelete.toLowerCase()==='yes'){
          $scope.deleteSchoolBtn = true;
          ManagementService.deleteSchoolById({id:$scope.schoolId})
           .then(function(response) {
                if(response.status==200){
                  $("#deleteSchoolModalPopup").modal('hide');
                  UtilityService.showToast('success','School successfully deleted.');
                  $scope.getDistrictSchooles();
                }else{
                   UtilityService.showToast('error','Something went wrong.');
               }
                 $scope.deleteSchoolBtn = false;
            }, function(error) {
              $scope.deleteSchoolBtn = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
         }
          
   }

   /*Open district form*/
   $scope.addSchoolForm = function(){
    $scope.formTitle = 'Add New School';
    $scope.schoolAddBtn = true;
    $scope.schoolUpdateBtn = false;
    $scope.districtFiled = true;
    $scope.e2 = $stateParams.id;
    $scope.schoolName = '';
    $scope.schoolForm.$setPristine();
    $scope.schoolForm.$setUntouched();
    $('#addSchoolFormModal').modal('show');
   }

   $scope.saveSchool = function(){
    if($scope.schoolForm.$valid){
        $scope.schoolSaveBtn = true;
         ManagementService.addSchool({schoolName:$scope.schoolName,e2:$scope.e2})
             .then(function(response) {
                  if(response.data.success){
                      $scope.schoolName = '';
                      $scope.e2 = '';
                      $scope.schoolForm.$setPristine();
                      $scope.schoolForm.$setUntouched();
                      $("#addSchoolFormModal").modal('hide');
                      $scope.getDistrictSchooles();
                     UtilityService.showToast('success','School successfully added.');
                   }else{
                      UtilityService.showToast('error','School name already exist.');
                }
                $scope.schoolSaveBtn = false;
                }, function(error) {
                   $scope.schoolSaveBtn = false;
                    UtilityService.showToast('error','Something went wrong.');
                });
    }
   };

   $scope.editSchoole = function(index){
     $scope.schoolObj=angular.copy($scope.schoolList[index]);
      $scope.formTitle = 'Edit School';
      $scope.schoolAddBtn = false;
      $scope.schoolUpdateBtn = true;
      $scope.districtFiled = false;
      $scope.e2 = $scope.schoolObj.distId;
      $scope.schoolName = $scope.schoolObj.name;
      $scope.schoolForm.$setPristine();
      $scope.schoolForm.$setUntouched();
      $('#addSchoolFormModal').modal('show');
   };

    $scope.updateSchool = function(){
      if($scope.schoolForm.$valid){
         $scope.schoolsUpdateBtn = true;
         ManagementService.updateSchool({schoolName:$scope.schoolName,id:$scope.schoolObj._id})
             .then(function(response) {
                  if(response.data.success){
                      $scope.schoolName = '';
                      $scope.e2 = '';
                      $scope.schoolForm.$setPristine();
                      $scope.schoolForm.$setUntouched();
                      $("#addSchoolFormModal").modal('hide');
                       $scope.getDistrictSchooles();
                     UtilityService.showToast('success','School successfully updated.');
                   }else{
                      UtilityService.showToast('error','School name already exist.');
                }
                $scope.schoolsUpdateBtn = false;
                }, function(error) {
                   $scope.schoolsUpdateBtn = false;
                    UtilityService.showToast('error','Something went wrong.');
                });
      }
   }


   $scope.teachersSettings = function(){
    $scope.appSettingShow = true;
    $scope.pinBtnDisables = true;
        ManagementService.getTeachersAppSettings({})
             .then(function(response) {
                if(response.data.success){
                  $scope.appSettingsObj = response.data.data;
                  $scope.teacherPin = response.data.data.pin;
                  if(response.data.data.assessment_from && response.data.data.assessment_to){
                    $scope.assessment_from = $filter('date')(response.data.data.assessment_from, "dd/MM/yyyy");
                    $scope.assessment_to =  $filter('date')(response.data.data.assessment_to, "dd/MM/yyyy");
                  }
                 }else{
                      UtilityService.showToast('error','Something went wrong.');
                 }
                 $scope.appSettingShow = false;
                 $scope.appSettingForm = true;
                 $scope.pinBtnDisables = false;
                }, function(error) {
                    UtilityService.showToast('error','Something went wrong.');
                });
   };

   $scope.editPin = function(){
      $scope.teacherSettingPin = $scope.appSettingsObj.pin;
      $('#editPinModal').modal('show');
   };

   $scope.savePin = function(){
    if($scope.pinForm.$valid){
       $scope.pinSaveBtn = true;
        ManagementService.updateTeacherPin({pin:$scope.teacherSettingPin,id:$scope.appSettingsObj._id})
             .then(function(response) {
                if(response.data.success){
                    $scope.teachersSettings();
                    $('#editPinModal').modal('hide');
                     UtilityService.showToast('success','Pin successfully updated.');
                  }else{
                      UtilityService.showToast('error','Something went wrong.');
                 }
                 $scope.pinSaveBtn = false;
                }, function(error) {
                    UtilityService.showToast('error','Something went wrong.');
         });
    }
   };

   $scope.activateApp = function(status, isConfirm){ 
      if(!isConfirm){
         $scope.appStatusAlertMessage = ((status) ? 'Are you sure you want to activate app?' : 'Are you sure you want to deactivate app?');
         $scope.appStatus = status;
         $('#appStatusChangeModal').modal('show');
         return false;
       }
       ManagementService.changeAppStatus({app_status:$scope.appStatus, id:$scope.appSettingsObj._id})
         .then(function(response) {
              if(response.data.success){
                UtilityService.showToast('success','Status successfully changed.');
                $scope.teachersSettings();
              }else{
                 UtilityService.showToast('error','Something went wrong.');
             }
                $('#appStatusChangeModal').modal('hide');
          }, function(error) {
               $('#appStatusChangeModal').modal('hide');
               UtilityService.showToast('error','Something went wrong.');
          });
         
   };

  
   /*Load teachers list*/
     $scope.teachers = function(){
      $scope.teachersList =[];
      $scope.allTeachersEmails = [];
      $scope.disableEmailSelectBox = true;
      $scope.teachersListLoader = true;
       ManagementService.teachers()
            .then(function(response) {
                if(response.data.success){
                     angular.forEach(response.data.data.data,function(result){
                     $scope.teachersList.push(result);
                     $scope.allTeachersEmails.push(result.email)
                   });
                  $scope.disableEmailSelectBox = false;
                  $scope.teachersListLoader = false;
                } 
               }, function(error) {
                $scope.disableEmailSelectBox = false;
                $scope.teachersListLoader = false;
                 //UtilityService.showToast('error','Something went wrong.');
            });
     };
     /* Default load teachers*/
      $scope.teachers();
 
     
     $scope.selectTeacherMailType = function(){
      if($scope.mailType=='all'){
         $scope.teacherEmailForm.subject = 'KRS App - New Access PIN Code…';
         $scope.teacherEmailForm.message = 'The PIN to access the KRS App has changed. Please'+
                                           ' use the new PIN provided below.'+
                                           ' Thank you!'+
                                           ' PIN Code:'+$scope.appSettingsObj.pin;
         $('#teacherEmailModel').modal('show');
         $scope.teacherEmailForm.to = $scope.allTeachersEmails.toString();
         
       }else if($scope.mailType=='selectedTeachers'){
         $('#parentTeacherChk').prop('checked', false);
         $('.teacherChk').prop('checked', false);
         $('#teachersListModal').modal('show');
       }
     };

     $scope.sendMailToTeachers = function(){
         $scope.teacherEmailBtn = true;
         ManagementService.sendEmailToTeachers($scope.teacherEmailForm)
           .then(function(response) {
             $scope.teacherEmailBtn = false;
               if(response.data.success){
                   UtilityService.showToast('success','Email successfully sent.');
                   $("#teacherEmailModel").modal('hide');
                   $scope.teacherEmailForm = angular.copy(ManagementService.teacherEmailForm);
                   $scope.teacherEmail.$setPristine();
                   $scope.teacherEmail.$setUntouched();
                   $scope.resetTeacherEmailSelect();
                }else{
                   UtilityService.showToast('error','Something went wrong.');
               }
            }, function(error) {
                 $scope.teacherEmailBtn = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
     };

  
    $scope.selectAllChk = function(){
        var parentChk = $('#parentTeacherChk').prop("checked");

          if(parentChk){
           $('.teacherListChk').prop('checked', true);
          }else{
            $('.teacherListChk').prop('checked', false);
          }
    };

    $scope.emailToSelectedTeacher = function(){
          $scope.teacherEmails = [];
          
          $('#teachersListModal').modal('hide');
          $('.teacherListChk:checked').each(function(i){
           var techrEmail = $('#'+this.id).attr('data-email');
            $scope.teacherEmails.push(techrEmail);
           });
           
         $scope.teacherEmailForm.to = $scope.teacherEmails.toString();
         $scope.teacherEmailForm.subject = 'KRS App - New Access PIN Code…';
         $scope.teacherEmailForm.message = 'The PIN to access the KRS App has changed. Please'+
                                           ' use the new PIN provided below.'+
                                           ' Thank you!'+
                                           ' PIN Code:'+$scope.appSettingsObj.pin;   
          $("#teacherEmailModel").modal('show');  
          $('#parentTeacherChk').prop('checked', false);
          $('.teacherListChk').prop('checked', false);                                
     
    };

    $scope.resetTeacherEmailSelect = function(){
        $scope.mailType = '';
    };

    $scope.editAssesment = function(){

        if($scope.appSettingsObj.assessment_from && $scope.appSettingsObj.assessment_to){
          $scope.assessmentFrom = angular.copy(new Date($scope.appSettingsObj.assessment_from));
          $scope.assessmentTo =  angular.copy(new Date($scope.appSettingsObj.assessment_to));
          
        }
      $('#editAssesment').modal('show');
    };

 

  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(2020, 5, 22),
    minDate: new Date(),
    showWeeks: false
   };

   

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.open2 = function() {
    $scope.popup2.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.dt = new Date(year, month, day);
  };

  $scope.formats = ['dd/MM/yyyy','dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];
  $scope.altInputFormats = ['M!/d!/yyyy'];

  $scope.popup1 = {
    opened: false
  };

  $scope.popup2 = {
    opened: false
  };

  $scope.updateAssessment = function(){
    var assessmentFrom  = moment($scope.assessmentFrom).format('YYYY-MM-DD');
    var assessmentTo    = moment($scope.assessmentTo).format('YYYY-MM-DD');
    var todaysDate = moment();
    var local = moment(todaysDate).local().format('YYYY-MM-DD');
     if($scope.assessmentForm.$valid){
        if($scope.assessmentFrom<$scope.assessmentTo){
         $scope.assessmentUpdateBtn = true;
          var data = {
            assessment_from :  assessmentFrom,
            assessment_to : assessmentTo,
            local_date:local,
            id : $scope.appSettingsObj._id
          };
           ManagementService.updateAssessment(data)
             .then(function(response) {
              $scope.assessmentUpdateBtn = false;
                 if(response.data.success){
                  $scope.teachersSettings();
                     UtilityService.showToast('success','Assessment period successfully updated.');
                      $("#editAssesment").modal('hide');
                      }else{
                     UtilityService.showToast('error',response.data.message);
                 }
              }, function(error) {
                   $scope.assessmentUpdateBtn = false;
                   UtilityService.showToast('error','Something went wrong.');
              });
            }else{
                UtilityService.showToast('error','To date can not be less than from date');
            }
         }
    
  };

  $scope.backToDistrict = function(){
    $state.go('admin.managementDestrict',{'id':$stateParams.cid});
  };


  $scope.deleteCountyModalPopup = function(id,name){
    $scope.countyId = id;
     $scope.countyName = name;
     $scope.removeConfirmModal = false;
    $scope.removeCountyMsg = true;

    $('#deleteCountyModalPopup').modal('show');
  };


  $scope.deleteDistrictModalPopup = function(id,name){
    $scope.districtId = id;
    $scope.districtName = name;
    $scope.districtRemoveConfirmModal = false;
    $scope.districtRemoveMsg = true;
    $('#deleteDistrictModalPopup').modal('show');
  };


   $scope.deleteSchoolModalPopup = function(id,name){
    $scope.schoolId = id;
    $scope.schoolName = name;
    $scope.schoolRemoveConfirmModal = false;
    $scope.schoolRemoveMsg = true;
    $('#deleteSchoolModalPopup').modal('show');
  };

	}]);
})();