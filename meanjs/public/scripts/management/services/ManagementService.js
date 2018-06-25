!(function(){
	angular.module('firstFiveApp').service('ManagementService',['$http','appConstant',function($http,appConstant){
     
     this.teacherEmailForm = {
        'cc':'',
        'bcc':'',
        'subject':'',
        'message': ''
       }

      /*Teacher Add api*/
     this.addTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/add',data);
     }
     
      /*Get county by name api*/
     this.getDistrictByName = function(data){ 
        var keyword = (data.keyword) ? data.keyword : '';
        return $http.get(appConstant.apiUrl+'districts/search_by_name?name='+keyword);
     }

      /*Delete county api*/
     this.deleteCountyById = function(data){ 
        return $http.get(appConstant.apiUrl+'county/delete/'+data.id);
     }

     /*Delete district api*/
     this.deleteDistrictById = function(data){ 
        return $http.get(appConstant.apiUrl+'district/delete/'+data.id);
     }

    
     /*Delete school api*/
     this.deleteSchoolById = function(data){ 
        return $http.get(appConstant.apiUrl+'schools/delete/'+data.id);
     } 

      /*Get district by id api*/
     this.getDistrictsByCountyId = function(data){ 
        return $http.get(appConstant.apiUrl+'manage_district/'+data.id);
     }
    
     /*County Add api*/
     this.addCounty = function(data){ 
        return $http.post(appConstant.apiUrl+'counties/add',data);
     }

      /*District Add api*/
     this.addDistrict = function(data){ 
        return $http.post(appConstant.apiUrl+'districts/add',data);
     }

     /*District Add api*/
     this.addSchool = function(data){ 
        return $http.post(appConstant.apiUrl+'schools/add',data);
     }
  
  
     /*County Update api*/
     this.updateCounty = function(data){ 
        return $http.post(appConstant.apiUrl+'counties/update',data);
     }

     /*District Update api*/
     this.updateDistrict = function(data){ 
        return $http.post(appConstant.apiUrl+'districts/update',data);
     }

     /*School Update api*/
     this.updateSchool = function(data){ 
        return $http.post(appConstant.apiUrl+'schools/update',data);
     }




     /*Get total County api*/
     this.getCountyCount = function(data){ 
        return $http.get(appConstant.apiUrl+'management');
     }


     /*Get total County api*/
     this.getDistrictSchooles = function(data){ 
        return $http.get(appConstant.apiUrl+'manage_schools/'+data.id);
     }
       
        /*Get teachers pin api*/
     this.getTeachersAppSettings = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/teachers/appSettings');
     }

      /*Update Teachers PIN api*/
     this.updateTeacherPin = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/teachers/pin/update',data);
     }

      /*Active Inactive App api*/
     this.changeAppStatus = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/teachers/changeAppStatus',data);
     }

      /*Send mail to all teachers api*/
     this.sendNewPinToTeachers = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/teachers/changeAppStatus',data);
     }
     
      /*Teachers List api*/
     this.teachers = function(data){ 
        return $http.get(appConstant.apiUrl+'teachers?admin_teacher=1',data)
     }

       /*Send Email to teachers api*/
     this.sendEmailToTeachers = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/email',data)
     }

      /*Update assesment api*/
     this.updateAssessment = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/teachers/assessment/update',data)
     }
       
	}]);
})();