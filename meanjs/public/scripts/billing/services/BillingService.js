!(function(){
	angular.module('firstFiveApp').service('BillingService',['$http','appConstant',function($http,appConstant){
     
      /*Get county by name api*/
     this.getAllCounties = function(data){ 
        return $http.post(appConstant.apiUrl+'billing',data);
     }

     /*Update school status api*/
     this.changeBillingStatus = function(data){ 
        return $http.post(appConstant.apiUrl+'change_billing_status',data);
     }

     /*Update county amount api*/
     this.updateCountyAmount = function(data){ 
        return $http.post(appConstant.apiUrl+'update_county_amount',data);
     }

      /*Update district amount api*/
     this.updateDistrictAmount = function(data){ 
        return $http.post(appConstant.apiUrl+'update_district_amount',data);
     }

      /*Update school amount api*/
     this.updateSchoolAmount = function(data){ 
        return $http.post(appConstant.apiUrl+'update_school_amount',data);
     }

     /*Update county amount api*/
     this.updateDistrictStatus = function(data){ 
        return $http.post(appConstant.apiUrl+'update_district_status',data);
     }

     /*Teacher Update api*/
     this.exportBillingReport = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/exportTeachersReport',data)
     }
  
	}]);
})();