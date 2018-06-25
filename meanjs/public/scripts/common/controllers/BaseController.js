!(function(){
	angular.module('firstFiveApp').controller('BaseController',['$rootScope','$scope','$state','UtilityService',function($rootScope,$scope,$state,UtilityService){
      $rootScope.currentState = '';
      $rootScope.alertHeaderMessage = '';
      $rootScope.alertMessage = '';
      setTimeout(function(){
        $rootScope.currentState = $state.current.name;
        $rootScope.$apply();
      },1000);


      $scope.logout = function(){
         UtilityService.removeLocalStorage('user');
         $state.go('home.login');
      };
     
	}]);
})();