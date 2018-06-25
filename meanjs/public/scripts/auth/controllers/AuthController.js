!(function(){
	angular.module('firstFiveApp').controller('AuthController',['$scope','$state','UtilityService','AuthService',function($scope,$state,UtilityService, AuthService){
     $scope.loginForm = angular.copy({'username':'','password':''});

     $scope.login = function(){
        if($scope.form.$valid){
            $scope.loginBtn = true;
            AuthService.login($scope.loginForm)
                    // then() called when son gets back
                    .then(function(response) {
                       if(response.data.success){
                        UtilityService.setLocalStorage('user',true);
                        $state.go('admin.dashboard'); 
                       }else{
                         UtilityService.showToast('error','Invalid username or password.');
                       }
                        $scope.loginBtn = false;
                    }, function(error) {
                         $scope.loginBtn = false;
                        // promise rejected, could log the error with: console.log('error', error);
                         UtilityService.showToast('error','Invalid username or password.'); 
                    });
            }
     }
	}]);
})();