!(function(){
	angular.module('firstFiveApp').service('AuthService',['$http','appConstant',function($http,appConstant){
     /*Admin Login api*/
     this.login = function(data){ 
        return $http.post(appConstant.apiUrl,data)
     }
	}]);
})();