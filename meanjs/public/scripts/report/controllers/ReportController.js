!(function(){
	angular.module('firstFiveApp').controller('ReportController',['$scope','$state','$ngBootbox','UtilityService','ReportService',function($scope,$state,$ngBootbox ,UtilityService,ReportService){
       
    $scope.countyList = [];
    $scope.districtList = [];
    $scope.schoolList = [];
    $scope.teachersList = [];
    $scope.downloadAllCountiesBtn =true;
    $scope.downloadCountyReportBtn =true;
    $scope.downloadDistrictReportBtn = true;
    $scope.downloadSchoolesReportBtn = true;
    $scope.downloadTeachersReportBtn = true;

    $scope.getAllCounties = function(){
      $scope.countyList = [];
       ReportService.getAllCounties({})
            .then(function(response) {
              if(response.status==200){
               $scope.countyList = response.data;
              }
                   
            }, function(error) {
                 // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
    };
 
$scope.getAllCounties();

      $scope.getDistrictsByCounty = function(){
         if(!$scope.countyId){
            $scope.districtList = [];
            $scope.schoolList = [];
            $scope.teachersList = [];
            $scope.downloadAllCountiesBtn = true;
             $scope.downloadCountyReportBtn = true;
             return false;
         }
           $scope.downloadAllCountiesBtn = false;
           ReportService.getDistrictsByCounty({id:$scope.countyId})
            // then() called when son gets back
            .then(function(response) {
               if(response.status==200){

                $scope.districtList = response.data;
               }
            }, function(error) {
                 // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
      };
 

      $scope.getSchoolByDistrict = function(){
           if(!$scope.districtId){
            $scope.schoolList = [];
            $scope.teachersList = [];
            $scope.downloadCountyReportBtn = true;
               return false;
           }
           $scope.downloadCountyReportBtn = false;
           ReportService.getSchoolsByDistrict({id:$scope.districtId})
            // then() called when son gets back
            .then(function(response) {
                   if(response.status==200){
                $scope.schoolList = response.data;
               }                  
            }, function(error) {
                 // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
      };


      $scope.getTeachersBySchoole = function(){
          if(!$scope.districtId){
            $scope.teachersList = [];
             $scope.downloadDistrictReportBtn = true;
            return false;
           }
           $scope.downloadDistrictReportBtn = false;
           ReportService.getTeachersBySchoole({distId:$scope.districtId,schoolId:$scope.schoolId})
            // then() called when son gets back
            .then(function(response) {
               $scope.teachersList = response.data;
             }, function(error) {
                 // promise rejected, could log the error with: console.log('error', error);
                 UtilityService.showToast('error','Something went wrong.');
            });
      };

         
      $scope.getAllCountyReport = function(){
          ReportService.getAllCountyReport({})
            .then(function(response) {

               }, function(error) {
                 UtilityService.showToast('error','Something went wrong.');
            });
      };   


        $scope.getAllFormateCountyReport = function(){
          ReportService.getAllFormateCountyReport({})
            .then(function(response) {

               }, function(error) {
                 UtilityService.showToast('error','Something went wrong.');
            });
      };   


	}]);
})();