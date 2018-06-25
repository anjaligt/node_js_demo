!(function(){
	angular.module('firstFiveApp').controller('TeacherController',['$scope','$rootScope','$state','$ngBootbox','$timeout','UtilityService','TeacherService','appConstant',function($scope,$rootScope,$state,$ngBootbox,$timeout ,UtilityService,TeacherService,appConstant){
     $scope.teachersList = [];
     $scope.associatedTeachersList = [];
     $scope.counties = [];
     $scope.contyDistricts = [];
     $scope.districtSchooles =  [];
     $scope.teachersActivityList             =   [];
     $scope.teachersIds = [];
     $scope.reportData = {fields:[],data:[]};
     $scope.teacherReportData= {fields:['First Name', 'Last Name', 'Email', 'County', 'District', 'School', 'Created On', '#Students', 'Admin Teacher'],data:[]};
     $scope.adminTeacherReportData = {fields:['First Name', 'Last Name', 'Email', 'County', 'District'],data:[]};
     $scope.activityReportData = {fields:['Teachers', 'Created On', 'County', 'District', 'School', 'Student', 'Literacy Completed', 'Numeracy Completed', 'Soc/Emo/Phy Completed'],data:[]};
     $scope.teachersCount = 0;
     $scope.adminTeachersCount = 0;
     $scope.actionGlobalUser = 'teacher';
     $scope.teacherForm = angular.copy(TeacherService.teacherForm);
     $scope.teacherEmailForm = angular.copy(TeacherService.teacherEmailForm);
     $scope.adminTeacherForm = angular.copy(TeacherService.teacherForm);
     $scope.filterYears = UtilityService.filterYearsList();
     $scope.activityFilterDate = UtilityService.curentAssessmentYear();
     $scope.teacherForm.admin_teachers = false;
     $scope.setCurrentCounty = '';
     var userResendPswrdIndex = '';
     $('body').removeClass('modal-open');
      $('.modal-backdrop').remove();
      
     /*Load teachers list*/
     $scope.teachers = function(){
     	$scope.teachersList = [];
      $scope.listLoader = true;
      $scope.reportData.fields =[];
      $scope.reportData.data = [];
       $("#teacherListChk").prop('checked', false);
       UtilityService.reinitializeTable('teachersListTables');
     	 TeacherService.teachers()
            // then() called when son gets back
            .then(function(response) {
                 $scope.listLoader = false;  
               if(response.data.success){
                  $scope.counties = response.data.data.counties;
                  $scope.districts = response.data.data.districts;
                  $scope.schooles = response.data.data.schooles;
                  $scope.teachersCount  = response.data.data.normal_teacher_count;
                  $scope.adminTeachersCount  = response.data.data.admin_teacher_count;
                   var fields = ['First Name', 'Last Name', 'Email', 'County', 'District', 'School', 'Created On', '#Students', 'Admin Teacher'];
                    $scope.reportData.fields = fields;
                  angular.forEach(response.data.data.data,function(result){
                    result.loggedintime =  UtilityService.changeDateToTime(result.loggedintime);
                     $scope.teachersList.push(result);
                      $scope.reportData.data.push({
                       'First Name': result.firstName,
                       'Last Name': result.lastName,
                       'Email': result.email,
                       'County': result.county_name,
                       'District': result.district_name, 
                       'School': result.schoolName,
                       'Created On' : new Date(result.created).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                       '#Students' : result.student_count, 
                       'Admin Teacher' : result.admin_teacher_email
                    });
                  });
                  UtilityService.initializeDataTable('teachersListTables',{ orderable: false, targets: [0,11] });
                }else{
                 UtilityService.showToast('error','Something went wrong.');
               }
               
                
            }, function(error) {
                $scope.listLoader = false;  
                // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
     };

     /*Load teaches list*/
      $scope.teachers();

      $scope.changeTab = function(id){ 
        $(".tab-change").removeClass('active');
        $(".tab-class").removeClass('in');
        $('#'+id).addClass('active');
        $('#'+id).addClass('in');
      };

     $scope.checkAllAdminCheckBox = function(){  
      $scope.adminTeacherReportData.data =[];
        var parentChk = $('#adminTeacherParentChk').prop("checked");
       if(parentChk){
         $('.adminTeacherChk').prop('checked', true);
        }else{
          $('.adminTeacherChk').prop('checked', false);
        }
      };

      $scope.addTeacher = function(){
         $scope.teacherForm = angular.copy(TeacherService.teacherForm);
         $scope.teacherFrm.$setPristine();
         $scope.teacherFrm.$setUntouched();
         $scope.addTeacherBtn = true;
         $scope.updateTeacherBtn = false;
         $scope.assinToAdmin = false;
        $('#addTeacherForm').modal('show');
        $scope.modalFormTitle = 'Add a New Teacher';
      };
 
       $scope.saveTeacher = function(){
         if($scope.teacherFrm.$valid){
           $scope.teacherForm.pin = UtilityService.pinCode();
           $scope.btnLoader = false; 
           $scope.btnDisable = true;
           $scope.teacherForm.admin_teacher = '1';
           TeacherService.addTeacher($scope.teacherForm)
           .then(function(response) {
                $scope.btnLoader = false;  
                $scope.btnDisable = false;
               if(response.data.success){
                 $scope.teacherForm = angular.copy(TeacherService.teacherForm);
                 $scope.teacherFrm.$setPristine();
                 $scope.teacherFrm.$setUntouched();
                 UtilityService.showToast('success','Teacher successfully created.');
                 $('#addTeacherForm').modal('hide');
                 $scope.teachers();
                }else{
                   UtilityService.showToast('error',((response.data.message.length) ? response.data.message[0].message  : 'Something went wrong.'));
               }
            }, function(error) {
                  $scope.btnLoader = false; 
                  $scope.btnDisable = false;
                // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
        }
      };

      $scope.openActionPopup = function(user){
        $scope.actionGlobalUser = user;
        $("#actionModalPopup").modal('show');
      };

      $scope.deleteTeacherPopup = function(){
        $scope.teachersIds =[];
        $rootScope.alertHeaderMessage = 'Action';
        $rootScope.alertMessage = 'Please select at least one teacher before executing this action.';
        if($scope.actionGlobalUser=='teacher'){

           $('.teacherListChk:checked').each(function(i){
               $scope.teachersIds.push($(this).val());
              });
           if(!$scope.teachersIds.length){
            $("#actionModalPopup").modal('hide');         
            $("#alertErrorModalPopup").modal('show');
            return false;
          }

          $scope.confirmMessage ='Are you sure you want to delete the selected teachers?';
          $scope.showAdminDeleteMsg = false;
          $("#actionModalPopup").modal('hide');
          $('#deleteTeachersMsgModal').modal('show');
         }
      

         if($scope.actionGlobalUser=='adminTeacher'){
          $('.adminTeacherChk:checked').each(function(i){
               $scope.teachersIds.push($(this).val());
              });

           if(!$scope.teachersIds.length){
            $("#actionModalPopup").modal('hide');
            $("#alertErrorModalPopup").modal('show');
              return false;
          }

          $scope.confirmMessage ='Are you sure you want to delete the selected admin teachers?';
          $scope.showAdminDeleteMsg = true;
          $("#actionModalPopup").modal('hide');
          $('#deleteTeachersMsgModal').modal('show');
        }
      };
 
      $scope.deleteTeacher = function(id){
        $("#deleteTeachersMsgModal").modal('hide');
         $scope.adminTeacher = ($scope.actionGlobalUser=='teacher') ? 1 : 2;
         TeacherService.deleteTeacher({teachers:$scope.teachersIds,admin_teacher: $scope.adminTeacher})
           .then(function(response) {
                if(response.data.success){
                  UtilityService.showToast('success','Teacher successfully deleted.');
                      if($scope.actionGlobalUser=='teacher'){
                        $scope.teachers();
                     }else{
                       $scope.adminTeachers();
                     }
                  
                }else{
                   UtilityService.showToast('error','Something went wrong.');
               }
            }, function(error) {
                 UtilityService.showToast('error','Something went wrong.');
            });
           
      };

      $('#teacherParentChk').on('click',function(){
        $scope.teacherReportData.data =[];
        var parentChk = $('#teacherParentChk').prop("checked");
         if(parentChk){
           $('.teacherListChk').prop('checked', true);
          }else{
            $('.teacherListChk').prop('checked', false);
          }
     });

    $scope.allActivityCheckBox = function(){
        var parentChk = $('#ActivityTeacherChk').prop("checked");
       if(parentChk){
         $('.activityChk').prop('checked', true);
        }else{
          $('.activityChk').prop('checked', false);
        }
      };

  

       $scope.openTeacherEmailPopup = function(){
        $scope.teacherEmailForm = angular.copy(TeacherService.teacherEmailForm);
        $scope.teacherEmail.$setPristine();
        $scope.teacherEmail.$setUntouched();
        var teacherEmails = [];
         if($scope.actionGlobalUser=='teacher'){
            $('.teacherListChk:checked').each(function(i){
                teacherEmails.push($(this).attr('data-email'));
            });
        }else if($scope.actionGlobalUser=='adminTeacher'){
            $('.adminTeacherChk:checked').each(function(i){
                teacherEmails.push($(this).attr('data-email'));
            });
        }else{
            $('.activityChk:checked').each(function(i){
                teacherEmails.push($(this).attr('data-email'));
            });
        }
        if(!teacherEmails.length){
          $("#actionModalPopup").modal('hide');
          $rootScope.alertHeaderMessage = 'Action';
          $rootScope.alertMessage = 'Please select at least one teacher before executing this action.';
          $("#alertErrorModalPopup").modal('show'); 
          return false;
        }
        
        $("#actionModalPopup").modal('hide');
        $("#teacherEmailModel").modal('show');
        $scope.teacherEmailForm.to = teacherEmails.toString();
      
       };

      $scope.sendMail = function(){
       if($scope.teacherEmail.$valid){ 
           var teachers = [];
            $('.teacherChk:checked').each(function(i){
                  teachers.push($(this).val());
                });
             
            if(!teachers.length && !$scope.teacherEmailForm.to){
              $("#teacherEmailModel").modal('hide');
                $rootScope.alertHeaderMessage = 'Action';
                $rootScope.alertMessage = 'Please select at least one teacher before executing this action.';
                $("#alertErrorModalPopup").modal('show'); 
                return false;
             }

             $scope.teacherEmailBtn = true;
             TeacherService.sendEmailToTeachers($scope.teacherEmailForm)
               .then(function(response) {
                 $scope.teacherEmailBtn = false;
                   if(response.data.success){
                      UtilityService.showToast('success','Email successfully sent.');
                     $("#teacherEmailModel").modal('hide');
                     $scope.teacherEmailForm = angular.copy(TeacherService.teacherEmailForm);
                     $scope.teacherEmail.$setPristine();
                     $scope.teacherEmail.$setUntouched();
                    }else{
                       UtilityService.showToast('error','Something went wrong.');
                   }
                }, function(error) {
                   $scope.teacherEmailBtn = false;
                     UtilityService.showToast('error','Something went wrong.');
                });

       }
      }

      /*Edit form*/
      $scope.editTeacher = function(index){
          $scope.addTeacherBtn = false;
          $scope.updateTeacherBtn = true;
          $scope.assinToAdmin = true;
          $scope.setCurrentCounty = angular.copy($scope.teachersList[index].county_id);
          $scope.teacherObj = angular.copy($scope.teachersList[index]);
          $scope.teacherForm._id = $scope.teacherObj._id;
          $scope.teacherForm.firstName = $scope.teacherObj.firstName;
          $scope.teacherForm.lastName = $scope.teacherObj.lastName;
          $scope.teacherForm.email = $scope.teacherObj.email;
          $scope.teacherForm.e3 = $scope.teacherObj.schoolId;
          $scope.teacherForm.e1 = $scope.teacherObj.county_id;
          $scope.teacherForm.admin_teachers = false;
          $scope.getCountyDistricts($scope.teacherObj.county_id,'teacher',true);
          $('#addTeacherForm').modal('show');
          $scope.modalFormTitle = $scope.teacherObj.firstName+' '+$scope.teacherObj.lastName;
      };

       /*
       * Submit Admin Update Form
       */
       $scope.submitTeacherUpdateForm = function(){
             if($scope.teacherFrm.$valid){
              if($scope.setCurrentCounty!==$scope.teacherForm.e1){
                 $scope.adminTeacherUpdateConfirmBtn = false;
                 $scope.teacherUpdateConfirmBtn = true;
                 $('#addTeacherForm').modal('hide');
                 $('#updateTeacherConfirmModal').modal('show');
              }else{
                $scope.updateTeacher();
              }
            }
       };

      /*Update teacher*/
      $scope.updateTeacher = function(){
            $('#updateTeacherConfirmModal').modal('hide');
            $scope.teacherData = {};
            $scope.teacherData.editFirstName = $scope.teacherForm.firstName;
            $scope.teacherData.editLastName = $scope.teacherForm.lastName;
            $scope.teacherData.editEmail = $scope.teacherForm.email;
            $scope.teacherData.editTeacherId = $scope.teacherForm._id;
            $scope.teacherData.editschool = $scope.teacherForm.e3;
            $scope.teacherData.editadmin_teacher = ($scope.teacherForm.admin_teachers) ? 2 : 1;
             
             $scope.btnDisable = true;
             $scope.btnLoader = true;
             TeacherService.updateTeacher($scope.teacherData)
               .then(function(response) {
                  $scope.btnDisable = false;
                  $scope.btnLoader = false;
                   if(response.data.success){
                     $scope.teacherForm = angular.copy(TeacherService.teacherForm);
                     $scope.teacherFrm.$setPristine();
                     $scope.teacherFrm.$setUntouched();
                     UtilityService.showToast('success','Teacher successfully updated.');
                     $('#addTeacherForm').modal('hide');
                     $scope.teachers();
                    }else{
                       UtilityService.showToast('error',((response.data.message.length) ? response.data.message[0].message  : 'Something went wrong.'));
                   }
                }, function(error) {
                     $scope.btnDisable = false;
                     $scope.btnLoader = false;
                     UtilityService.showToast('error','Something went wrong.');
                });
        
      };



       /*Load admin teachers list*/
     $scope.adminTeachers = function(){
      $scope.adminTeachersList = [];
      $scope.adminListLoader = true;
      $scope.reportData.data = [];
       $scope.adminTeacherReportData.data =[];
      $("#adminTeacherParentChk").prop('checked', false);
       UtilityService.reinitializeTable('adminTeachersListTable');
       TeacherService.adminTeachers()
            // then() called when son gets back
            .then(function(response) {
                 $scope.adminListLoader = false;  
               if(response.data.success){
                  $scope.counties = response.data.data.counties;
                  $scope.districts = response.data.data.districts;
                  $scope.schooles = response.data.data.schooles;
                  $scope.teachersCount  = response.data.data.normal_teacher_count;
                  $scope.adminTeachersCount  = response.data.data.admin_teacher_count;
                  var fields = ['First Name', 'Last Name', 'Email', 'County', 'District'];
                  $scope.reportData.fields = fields;
                  angular.forEach(response.data.data.data,function(result){
                     $scope.adminTeachersList.push(result);
                     $scope.reportData.data.push({
                       'First Name': result.firstName,
                       'Last Name': result.lastName,
                       'Email': result.email,
                       'County': result.county_name,
                       'District': result.district_name
                      });
                  });
                    UtilityService.initializeDataTable('adminTeachersListTable',{ orderable: false, targets: [0,7] });
                }else{
                 UtilityService.showToast('error','Something went wrong.');
               }
            }, function(error) {
                $scope.adminListLoader = false;  
                // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
     };



     


      $scope.getAssociatedTeachers = function(id){
        $scope.associatedTeachersList = [];
           TeacherService.associatedTeachers({id:id})
            // then() called when son gets back
            .then(function(response) {
              if(response.data.results.all_associated){
                $scope.associatedTeachersList    = response.data.results.all_associated;
                $scope.teachers_first_name       = response.data.results.teachers_first_name;
                $scope.teachers_last_name        = response.data.results.teachers_last_name;
                $('#adminSubTeachers').modal('show');
              }else{
              $rootScope.alertHeaderMessage =  response.data.results.teachers_first_name.substr(0,1).toUpperCase()+response.data.results.teachers_first_name.substr(1)+" "+response.data.results.teachers_last_name.substr(0,1).toUpperCase()+response.data.results.teachers_last_name.substr(1)+"'s Teachers";
              $rootScope.alertMessage = 'No Record Found.';
              $("#alertErrorModalPopup").modal('show'); 

              }
                  
            }, function(error) {
                 // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
      };

      $scope.adminAddTeacherForm = function(){
         $scope.adminTeacherForm = angular.copy(TeacherService.teacherForm);
         $scope.adminTeacherFrm.$setPristine();
         $scope.adminTeacherFrm.$setUntouched();
         $scope.adminAddTeacherBtn = true;
         $scope.adminUpdateTeacherBtn = false;
         $('#addAdminTeacherForm').modal('show');
      };

      $scope.getCountyDistricts = function(id,isUser,isUpdate){   
           $scope.contyDistricts =[];    
           TeacherService.countyDistricts({id:id})
            .then(function(response) {
                   $scope.contyDistricts  = response.data; 
                   if(isUpdate && isUser=='teacher'){
                     $scope.teacherForm.e2 = $scope.teacherObj.distId;
                     $scope.getDistrictSchooles($scope.teacherObj.distId,'teacher',true);
                   }  

                    if(isUpdate && isUser=='adminTeacher'){
                      $scope.adminTeacherForm.e2 = $scope.adminTeacherObj.distId;
                      $scope.getDistrictSchooles($scope.adminTeacherObj.distId,'adminTeacher',true);
                   }                 
            }, function(error) {
                 //UtilityService.showToast('error','Something went wrong.');
            });
      };

      $scope.selectCounty = function(isUserType){
        if(isUserType=='teacher'){
          if(!$scope.teacherForm.e1){
            $scope.contyDistricts = [];
             return false;
          }
          $scope.getCountyDistricts($scope.teacherForm.e1);
        }

         if(isUserType=='adminTeacher'){
          if(!$scope.adminTeacherForm.e1){
             $scope.contyDistricts = [];
             return false;
          }
          $scope.getCountyDistricts($scope.adminTeacherForm.e1);
        }
      }





      $scope.getDistrictSchooles = function(id,isUser,isUpdate){
             $scope.districtSchooles =[];
             TeacherService.districtSchooles({id:id})
            .then(function(response) {
                    $scope.districtSchooles  = response.data;  
                     if(isUpdate && isUser=='teacher'){
                     $scope.teacherForm.e3 = $scope.teacherObj.schoolId;
                    }  

                    if(isUpdate && isUser=='adminTeacher'){
                     $scope.adminTeacherForm.e3 = $scope.adminTeacherObj.schoolId;
                    }                  
            }, function(error) {
                // UtilityService.showToast('error','Something went wrong.');
            });
      };

       $scope.selectDistricts = function(isUserType){
        if(isUserType=='teacher'){
          if(!$scope.teacherForm.e2){
             $scope.districtSchooles = [];
             return false;
          }
          $scope.getDistrictSchooles($scope.teacherForm.e2);
        }

        if(isUserType=='adminTeacher'){
          if(!$scope.adminTeacherForm.e2){
             $scope.districtSchooles = [];
             return false;
          }
          $scope.getDistrictSchooles($scope.adminTeacherForm.e2);
        }
      }

         $scope.saveAdminTeacher = function(){
        
         if($scope.adminTeacherFrm.$valid){
           $scope.adminTeacherForm.pin = UtilityService.pinCode();
           var isAdminTeacher = $('#isAdminTeacher').prop("checked");
           $scope.btnLoader = false; 
           $scope.btnDisable = true;
          // $scope.adminTeacherForm.admin_teacher = (isAdminTeacher) ? '2' : '1';
           $scope.adminTeacherForm.admin_teacher = '2';
           TeacherService.addAdminTeacher($scope.adminTeacherForm)
           .then(function(response) {
                $scope.btnLoader = false;  
                $scope.btnDisable = false;
               if(response.data.success){
                 $scope.adminTeacherForm = angular.copy(TeacherService.teacherForm);
                 $scope.adminTeacherFrm.$setPristine();
                 $scope.adminTeacherFrm.$setUntouched();
                 UtilityService.showToast('success','Teacher successfully created.');
                 $('#addAdminTeacherForm').modal('hide');
                 $scope.adminTeachers();
                }else{
                   UtilityService.showToast('error',((response.data.message.length) ? response.data.message[0].message  : 'Something went wrong.'));
               }
            }, function(error) {
                  $scope.btnLoader = false; 
                  $scope.btnDisable = false;
                // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
        }
      };


      /*Edit form*/
      $scope.editAdminTeacher = function(index){
          $scope.adminAddTeacherBtn = false;
          $scope.adminUpdateTeacherBtn = true;
          $scope.setCurrentCounty = angular.copy($scope.adminTeachersList[index].county_id);
          $scope.adminTeacherObj = angular.copy($scope.adminTeachersList[index]);
          $scope.adminTeacherForm._id = $scope.adminTeacherObj._id;
          $scope.adminTeacherForm.firstName = $scope.adminTeacherObj.firstName;
          $scope.adminTeacherForm.lastName = $scope.adminTeacherObj.lastName;
          $scope.adminTeacherForm.email = $scope.adminTeacherObj.email;
          $scope.adminTeacherForm.e3 = $scope.adminTeacherObj.schoolId;
          $scope.adminTeacherForm.e1 = $scope.adminTeacherObj.county_id;
          $scope.getCountyDistricts($scope.adminTeacherObj.county_id,'adminTeacher',true);
          $scope.adminTeacherForm.admin_teachers = ($scope.adminTeacherObj.admin_teacher==2) ? true : false; 
          $('#addAdminTeacherForm').modal('show');
      };



      /*
       * Submit Admin Update Form
       */
       $scope.submitAdminTeacherUpdateForm = function(){
            if($scope.adminTeacherFrm.$valid){
              if($scope.setCurrentCounty!==$scope.adminTeacherForm.e1){
                 $scope.adminTeacherUpdateConfirmBtn = true;
                 $scope.teacherUpdateConfirmBtn = false;
                 $('#addAdminTeacherForm').modal('hide');
                 $('#updateTeacherConfirmModal').modal('show');
              }else{
                $scope.updateAdminTeacher();
              }
            }
       };

       /*Update teacher*/
      $scope.updateAdminTeacher = function(){
            $('#updateTeacherConfirmModal').modal('hide');
            $scope.adminTeacherData = {};
            var isAdminTeacher = $('#isAdminTeacher').prop("checked");
            $scope.adminTeacherData.editFirstName = $scope.adminTeacherForm.firstName;
            $scope.adminTeacherData.editLastName = $scope.adminTeacherForm.lastName;
            $scope.adminTeacherData.editEmail = $scope.adminTeacherForm.email;
            $scope.adminTeacherData.editTeacherId = $scope.adminTeacherForm._id;
            $scope.adminTeacherData.editschool = $scope.adminTeacherForm.e3;
            //$scope.adminTeacherData.editadmin_teacher = (isAdminTeacher) ? '2' : '1';
            $scope.adminTeacherData.editadmin_teacher = '2';
             
             $scope.btnDisable = true;
             $scope.btnLoader = true;
             TeacherService.updateAdminTeacher($scope.adminTeacherData)
               .then(function(response) {
                  $scope.btnDisable = false;
                  $scope.btnLoader = false;
                   if(response.data.success){
                     $scope.adminTeacherForm = angular.copy(TeacherService.teacherForm);
                     $scope.adminTeacherFrm.$setPristine();
                     $scope.adminTeacherFrm.$setUntouched();
                     UtilityService.showToast('success','Teacher successfully updated.');
                     $('#addAdminTeacherForm').modal('hide');
                      $scope.adminTeachers();
                    }else{
                       UtilityService.showToast('error',((response.data.message.length) ? response.data.message[0].message  : 'Something went wrong.'));
                   }
                }, function(error) {
                     $scope.btnDisable = false;
                     $scope.btnLoader = false;
                     UtilityService.showToast('error','Something went wrong.');
                });
        
      };


      $scope.exportTeachersReport = function(isUser){
        var data =[];
        $rootScope.alertHeaderMessage = 'Action';
        $rootScope.alertMessage = 'Please select at least one teacher before executing this action.';
       if(isUser=='teacher'){
         var parentChk = $('#teacherParentChk').prop("checked");
         if(!parentChk){
            if($scope.teacherReportData.data.length){
               data = $scope.teacherReportData;
            }else{          
              $("#alertErrorModalPopup").modal('show'); 
              return false;
            }
          }else{
            data = $scope.reportData;
          }

          data.file_name = 'KRS_Teachers';
         }

          if(isUser=='adminTeacher'){
           var parentChk = $('#adminTeacherParentChk').prop("checked");
           if(!parentChk){
              if($scope.adminTeacherReportData.data.length){
                 data = $scope.adminTeacherReportData;
              }else{
                $("#alertErrorModalPopup").modal('show'); 
                return false;
              }
            }else{
              data = $scope.reportData;
            }

            data.file_name = 'KRS_Admin_Teachers';
         }

           if(isUser=='teacherActivity'){ 
           var parentChk = $('#ActivityTeacherChk').prop("checked");
           if(!parentChk){
              if($scope.activityReportData.data.length){
                 data = $scope.activityReportData;
              }else{
                $("#alertErrorModalPopup").modal('show'); 
                return false;
              }
            }else{
              data = $scope.reportData;
            }

            data.file_name = 'Teachers_Activity';
         }
        
        
       if(!data.data.length){
           return false;
      }

      $scope.disableExportBtn = true;
      
       TeacherService.exportTeachersReport(data)
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


      /*Teachers Activity*/

$scope.teachersActivity = function() {
    var yearObj = UtilityService.convertAssessmentYear($scope.activityFilterDate);
    var data = {'from_date':yearObj.from_date, to_date:yearObj.to_date,'year':yearObj.year};
    $scope.teacherActivityLoader = true;
    $scope.teachersActivityList  = [];
    $scope.activityReportData.data = [];
    $scope.reportData.data = [];
     $("#ActivityTeacherChk").prop('checked', false);
     
     UtilityService.reinitializeTable('teachersActListTable');
     TeacherService.TeachersActivity(data)
            // then() called when son gets back
        .then(function(response) {
            $scope.teacherActivityLoader = false;  
            if(response.data.success){
             var fields =['Teachers', 'Created On', 'County', 'District', 'School', 'Student', 'Literacy Completed', 'Numeracy Completed', 'Soc/Emo/Phy Completed'];
              $scope.reportData.fields = fields;
              angular.forEach(response.data.data,function(result){
                 $scope.teachersActivityList.push(result);
                 $scope.reportData.data.push({
                  'id': result._id,
                  'Teachers': result.firstName+' '+result.lastName,
                   'Created On': new Date(result.createdIso).toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
                   'County' : result.county_name, 
                   'District' : result.district_name, 
                   'School' : result.schoolName, 
                   'Student': result.student_count, 
                   'Literacy Completed': result.literacy_count, 
                   'Numeracy Completed': result.numeracy_count, 
                   'Soc/Emo/Phy Completed': result.social_count});
              });
                            
            }else{
             UtilityService.showToast('error','Something went wrong.');
            }
             UtilityService.initializeDataTable('teachersActListTable',{ orderable: false, targets: [0,9] });
        }, function(error) {
            $scope.adminListLoader = false;  
            // promise rejected, could log the error with: console.log('error', error);
            UtilityService.showToast('error','Something went wrong.');
        });
};

  $scope.resendPasswordModal = function(index){
    userResendPswrdIndex = index;
    $("#resendPasswordModal").modal('show');
  }

   $scope.resendPassword = function(){  
          $scope.resendPasswordBtn = true;  
          $scope.teacherObj = $scope.teachersList[userResendPswrdIndex];
          var data = {id:$scope.teacherObj._id, email:$scope.teacherObj.email}            
          TeacherService.sendInvitationToTeacher(data)
           .then(function(response) {
                  $("#resendPasswordModal").modal('hide');
                  UtilityService.showToast('success','Invitation successfully sent.');
                  //$scope.teachers();
                  $scope.resendPasswordBtn = false; 
            }, function(error) {
               $scope.resendPasswordBtn = false; 
                 UtilityService.showToast('error','Something went wrong.');
            });        
   }

  $('#teachersListTables').on('page.dt', function () {
     $timeout(function() {
       var parentChk = $('#teacherParentChk').prop("checked");
         if(parentChk){
            $('.teacherListChk').prop('checked', true);
          } 
    }, 500);
     
  } );

  $('#adminTeachersListTable').on('page.dt', function () {
     $timeout(function() {
       var parentChk = $('#adminTeacherParentChk').prop("checked");
         if(parentChk){
            $('.adminTeacherChk').prop('checked', true);
          } 
    }, 500);
     
  } );

   $('#teachersActListTable').on('page.dt', function () {
     $timeout(function() {
       var parentChk = $('#ActivityTeacherChk').prop("checked");
         if(parentChk){
            $('.activityChk').prop('checked', true);
          } 
    }, 500);
     
  } );

    // Get Answer Indes By User Answer Array             
      function findIndexWithAttr(array, attr, value) {
          for (var i = 0; i < array.length; i += 1) {
              if (array[i][attr] === value) {
                  return i;
              }
          }
      }
   
  $scope.saveSelectedTeacherData = function(index,id,isUser){
    if(isUser=='teacher'){
      var teacherObjByIndex = $scope.teachersList[index];
      var isChk = $('#teach_'+id).prop("checked");
      var isExist = $scope.teacherReportData.data.filter(function(obj){
         return id==obj.id;
      });
         
      if(!isExist.length && isChk){
        $scope.teacherReportData.data.push({
                     'id': teacherObjByIndex._id,
                     'First Name': teacherObjByIndex.firstName,
                     'Last Name': teacherObjByIndex.lastName,
                     'Email': teacherObjByIndex.email,
                     'County': teacherObjByIndex.county_name,
                     'District': teacherObjByIndex.district_name, 
                     'School': teacherObjByIndex.schoolName,
                     'Created On' : new Date(teacherObjByIndex.created).toISOString().replace(/T/, ' ').replace(/\..+/, ''),
                     '#Students' : teacherObjByIndex.student_count, 
                     'Admin Teacher' : teacherObjByIndex.admin_teacher_email
                  });
       }else{
        var teachIndex = findIndexWithAttr($scope.teacherReportData.data, 'id', id);
        if(teachIndex!==undefined){
          $scope.teacherReportData.data.splice(teachIndex, 1);
        }
       }
   }


   if(isUser=='adminTeacher'){
      var teacherObjByIndex = $scope.adminTeachersList[index];
      var isChk = $('#teach_'+id).prop("checked");
      var isExist = $scope.adminTeacherReportData.data.filter(function(obj){
         return id==obj.id;
      });

      if(!isExist.length && isChk){
        $scope.adminTeacherReportData.data.push({
                     'id': teacherObjByIndex._id,
                     'First Name': teacherObjByIndex.firstName,
                     'Last Name': teacherObjByIndex.lastName,
                     'Email': teacherObjByIndex.email,
                     'County': teacherObjByIndex.county_name,
                     'District': teacherObjByIndex.district_name, 
                     });
       }else{
        var teachIndex = findIndexWithAttr($scope.adminTeacherReportData.data, 'id', id);
        if(teachIndex!==undefined){
          $scope.adminTeacherReportData.data.splice(teachIndex, 1);
        }
       }
   }

   if(isUser=='teacherActivity'){
      var teacherActObjByIndex = $scope.teachersActivityList[index];
      var isChk = $('#teachAct_'+id).prop("checked");
      var isExist = $scope.activityReportData.data.filter(function(obj){
         return id==obj.id;
      });
      if(!isExist.length && isChk){
        $scope.activityReportData.data.push({
                     'id': teacherActObjByIndex._id,
                     'Teachers': teacherActObjByIndex.firstName+' '+teacherActObjByIndex.lastName,
                     'Created On': new Date(teacherActObjByIndex.createdIso).toISOString().replace(/T/, ' ').replace(/\..+/, ''), 
                     'County' : teacherActObjByIndex.county_name, 
                     'District' : teacherActObjByIndex.district_name, 
                     'School' : teacherActObjByIndex.schoolName, 
                     'Student': teacherActObjByIndex.student_count, 
                     'Literacy Completed': teacherActObjByIndex.literacy_count, 
                     'Numeracy Completed': teacherActObjByIndex.numeracy_count, 
                     'Soc/Emo/Phy Completed': teacherActObjByIndex.social_count 
                     });
       }else{
        var teachActIndex = findIndexWithAttr($scope.activityReportData.data, 'id', id);
        if(teachActIndex!==undefined){
          $scope.activityReportData.data.splice(teachActIndex, 1);
        }
       }

        
   }
      
  };

	}]);
})();