!(function(){
	angular.module('firstFiveApp').service('ReportService',['$http','appConstant',function($http,appConstant){
     
 
     /*All Conty List api*/
     this.getAllCounties = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/getallCounties',data);
     }

     /*Get Districts by county id api*/
     this.getDistrictsByCounty = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/county/'+data.id+'/districts?id='+data.id,data);
     }
     

     /*Get Schools by district id api*/
     this.getSchoolsByDistrict = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/districts/'+data.id+'/schools?id='+data.id,data);
     }

     /*Get Teachers by School id api*/
     this.getTeachersBySchoole = function(data){ 
        return $http.get(appConstant.apiUrl+'v1/districts/'+data.distId+'/schools/'+data.schoolId+'/teachers?id='+data.schoolId,data);
     }

      /*Teacher Add api*/
     this.addTeacher = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers/add',data);
     }
     
      /*Get all county reports api*/
     this.getAllCountyReport = function(data){ 
        return $http.get(appConstant.apiUrl+'districts/all',data);
     }

      /*Get all county reports api*/
     this.getAllFormateCountyReport = function(data){ 
        return $http.get(appConstant.apiUrl+'format/districts/all',data);
     }
       
	}]);
})();