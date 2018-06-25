!(function(){
	angular.module('firstFiveApp').service('TeacherService',['$http','appConstant',function($http,appConstant){
     this.teacherForm = {
     	'firstName':'',
     	'lastName':'',
     	'email':'',
     	'e3': '', //SchoolId
     	'pin':''
     }

     this.teacherEmailForm = {
        'cc':'',
        'bcc':'',
        'subject':'',
        'message': ''
       }

     /*Teachers List api*/
     this.teachers = function(data){ 
        return $http.get(appConstant.apiUrl+'get_teachers?admin_teacher=1',data);
     }

     /*Teachers List api*/
     this.adminTeachers = function(data){ 
        return $http.get(appConstant.apiUrl+'get_teachers?admin_teacher=2',data);
     }

      /*Teacher Add api*/
     this.addTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/addByAdmin',data);
     }

      /*Teacher Update api*/
     this.updateTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/edit',data);
     }

      /*Teachers Delete api*/
     this.deleteTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/delete_teachers',data);
     }

     /*Send Email to teachers api*/
     this.sendEmailToTeachers = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/email',data);
     }

      /*Get associated teachers api*/
     this.associatedTeachers = function(data){ 
        return $http.get(appConstant.apiUrl+'teachers/get_associated/'+data.id,data);
     }

     /*Get county districts api*/
     this.countyDistricts = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/county/'+data.id+'/districts?id='+data.id,data);
     }

      /*Get district schooles api*/
     this.districtSchooles = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/districts/'+data.id+'/schools?id='+data.id,data);
     }



      /*Admin Teacher Add api*/
     this.addAdminTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/addByAdmin',data);
     }


      /*Teacher Update api*/
     this.updateAdminTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/edit',data);
     }

      /*Teacher Update api*/
     this.exportTeachersReport = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/exportTeachersReport',data);
     }

      /*Teacher Activity api*/
      this.TeachersActivity = function(data){ 
        var dateString = '';
        if(data.from_date && data.to_date){
           dateString = '?from_date='+data.from_date+'&to_date='+data.to_date;
        }
        return $http.get(appConstant.apiUrl+'teachers_activity_list'+dateString);
        //return $http.get(appConstant.apiUrl+'teachers_activity'+dateString)
     }

       /*Teacher Invitation send api*/
     this.sendInvitationToTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/resend',data);
     }

	}]);
})();