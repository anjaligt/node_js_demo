!(function() {
    angular.module('firstFiveApp').controller('BillingController', ['$scope', '$state', '$ngBootbox', '$stateParams','$timeout', 'UtilityService', 'BillingService','appConstant', function($scope, $state, $ngBootbox, $stateParams, $timeout, UtilityService, BillingService,appConstant) {
        $scope.countiesList = []; 
        $scope.noCountyFound = false;
        var billNoteData = {};
        $scope.showGreen = [];
        $scope.showBrown= [];
        $scope.billingAmount = [];
        $scope.reportYear =  UtilityService.curentAssessmentYear();
        $scope.filterYears = UtilityService.filterYearsList();
        $scope.currentAssessmentYear = UtilityService.curentAssessmentYear();
        /*
        * Get all county
        */
         $scope.getAllCounties = function(reportYear){ 
           $scope.reportYear = (reportYear) ? reportYear : $scope.reportYear;
           var yearObj = UtilityService.convertAssessmentYear($scope.reportYear);
           var data = {year:$scope.reportYear,from_date:yearObj.from_date,to_date:yearObj.to_date};
           $scope.countiesList = []; 
           $scope.billingListLoader = true;
           BillingService.getAllCounties(data)
           .then(function(response) {
              if(response.status==200){
                $scope.sountyResult = response.data.data.sort(function(a, b) {
                                var textA = a.county_name.toUpperCase();
                                var textB = b.county_name.toUpperCase();
                                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                            });
                
                angular.forEach($scope.sountyResult,function(result,count){ 
                  result.schooles = [];
                  $scope.billingAmount[count] = 0;
                      angular.forEach(result.districts_new,function(districtSchooles, key){
                         var distAmount = (districtSchooles.amount) ? districtSchooles.amount : 0;
                               result.schooles.push({
                                distTr : true, amount: distAmount,
                                distId : districtSchooles._id, 
                                districtName: districtSchooles.name, 
                                isBilled : districtSchooles.isBilled,
                                isPayed : districtSchooles.isPayed,
                                note : districtSchooles.note
                              });

                         $scope.billingAmount[count] += (distAmount) ? distAmount : 0; // Add School and district Amount
                         angular.forEach(districtSchooles.schools_new,function(schoolResult, schoolKey){
                            $scope.billingAmount[count] += (schoolResult.amount) ? schoolResult.amount : 0;
                            
                            // if(schoolKey==0){
                            //   var distAmount = (districtSchooles.amount) ? districtSchooles.amount : 0;
                            //    result.schooles.push({
                            //     distTr : true, amount: distAmount,
                            //     distId : districtSchooles._id, 
                            //     districtName: districtSchooles.name, 
                            //     isBilled : districtSchooles.isBilled,
                            //     isPayed : districtSchooles.isPayed,
                            //     note : districtSchooles.note
                            //   });

                            //    $scope.billingAmount[count] += (distAmount) ? distAmount : 0; // Add School and district Amount
                            // }
                            schoolResult.distId = districtSchooles._id;
                            schoolResult.districtName = districtSchooles.name;
                            result.schooles.push(schoolResult);
                         });
                      });
                      $scope.billingAmount[count] += (result.county_amount) ? result.county_amount : 0; // Add County Amount
                   $scope.countiesList.push(result);
                });
                 //console.log($scope.countiesList);
                 $scope.noCountyFound = (!$scope.countiesList.length) ? true : false;
              }
              $scope.billingListLoader = false;
            }, function(error) {
                 $scope.billingListLoader = false;
                 UtilityService.showToast('error','Something went wrong.');
            });
         };

         $scope.getAllCounties();
 
	    $scope.accordianTab = function(index){
		    $("#minus_"+index).toggleClass('display-none-cls');
        $("#plus_"+index).toggleClass('display-none-cls');
        $("#accordianTab_"+index).toggleClass('in');
	    };


      /*
      * Update billing value
      */
      $scope.changeBillingStatus = function(countyIndex, schoolIndex, id,isType,value){
        if(isType=='amount'){ 
          value = (value) ? parseFloat(value) : 0;
        }

         if(isType=='note'){
           value = $scope.billingNote;
           id= billNoteData.id;
           isType = billNoteData.isType;
           countyIndex = billNoteData.countyIndex;
           schoolIndex = billNoteData.schoolIndex;
        }

        var data = {id:id, isType:isType, value:value};
        BillingService.changeBillingStatus(data)
            .then(function(response) {
              if(response.data.success){
               if(isType=='note'){ 
                 $scope.billingNote = '';
                 $scope.countiesList[countyIndex]['schooles'][schoolIndex]['note'] = value;
                 if(value){
                  $scope.showGreen[id] = true;
                  $scope.showBrown[id] = false;
                 }else{
                  $scope.showGreen[id] = false;
                  $scope.showBrown[id] = true; 
                 }
                 $('#editDescription').modal('hide');
               }else if(isType=='payed'){
                  $scope.countiesList[countyIndex]['schooles'][schoolIndex]['isPayed'] = value;
               }else if(isType=='amount'){
                  $scope.countiesList[countyIndex]['schooles'][schoolIndex]['amount'] = value;
                  $scope.updateTotalBillingAmount(countyIndex, schoolIndex);
               }else if(isType=='billed'){
                  $scope.countiesList[countyIndex]['schooles'][schoolIndex]['isBilled'] = value;
               }
             }else{
               UtilityService.showToast('error','Something went wrong.');
             }

            }, function(error) {
                 UtilityService.showToast('error','Something went wrong.');
            });
      };

      /*
      * Update County Amount
      */
      $scope.updateCountyAmount = function(id,amount,isType,countyIndex){  
          var yearObj = UtilityService.convertAssessmentYear($scope.reportYear);
          amount = (amount) ? parseFloat(amount) : 0;
           var data = {id:id,amount:amount,year:$scope.reportYear,from_date:yearObj.assessment_from_date,to_date:yearObj.assessment_to_date};
           BillingService.updateCountyAmount(data)
            .then(function(response) {
              if(response.data.success){
                if(isType=='amount'){
                     $scope.countiesList[countyIndex]['county_amount'] = amount;
                     $scope.updateTotalBillingAmount(countyIndex, 0);
                 }
                  
              }
            },function(error){
               //  UtilityService.showToast('error','Something went wrong.');
            });
      };

      /*
      * Update District Amount
      */
      $scope.updateDistrictAmount = function(countyIndex, schoolIndex,id,isType,amount){  
          var yearObj = UtilityService.convertAssessmentYear($scope.reportYear);
          amount = (amount) ? parseFloat(amount) : 0;
           var data = {id:id,amount:amount,year:$scope.reportYear,from_date:yearObj.assessment_from_date,to_date:yearObj.assessment_to_date};
           BillingService.updateDistrictAmount(data)
            .then(function(response) {
              if(response.data.success){
                if(isType=='amount'){
                    $scope.countiesList[countyIndex]['schooles'][schoolIndex]['amount'] = amount;
                    $scope.updateTotalBillingAmount(countyIndex, schoolIndex);
                 }
                  
              }
            },function(error){
               //  UtilityService.showToast('error','Something went wrong.');
            });
      };

       /*
      * Update School Amount
      */
      $scope.updateSchoolAmount = function(countyIndex, schoolIndex,id,isType,amount){  
          var yearObj = UtilityService.convertAssessmentYear($scope.reportYear);
          amount = (amount) ? parseFloat(amount) : 0;
           var data = {id:id,amount:amount,year:$scope.reportYear,from_date:yearObj.assessment_from_date,to_date:yearObj.assessment_to_date};
           BillingService.updateSchoolAmount(data)
            .then(function(response) {
              if(response.data.success){
                if(isType=='amount'){
                    $scope.countiesList[countyIndex]['schooles'][schoolIndex]['amount'] = amount;
                    $scope.updateTotalBillingAmount(countyIndex, schoolIndex);
                 }
                  
              }
            },function(error){
               //  UtilityService.showToast('error','Something went wrong.');
            });
      };

      /*
      * Update Distriict Status
      */
      $scope.updateDistrictStatus = function(countyIndex, schoolIndex,id,isType,value){
          if(isType=='amount'){
            value = (value) ? parseFloat(value) : 0;
          }

          if(isType=='note'){
             value = $scope.billingNote;
             id= billNoteData.id;
             isType = billNoteData.isType;
             countyIndex = billNoteData.countyIndex;
             schoolIndex = billNoteData.schoolIndex;
          }
           var data = {id:id,value:value,type:isType};
           BillingService.updateDistrictStatus(data)
            .then(function(response) {
              if(response.data.success){
                 if(isType=='amount'){
                     $scope.countiesList[countyIndex]['schooles'][schoolIndex]['amount'] = value;
                     $scope.updateTotalBillingAmount(countyIndex, schoolIndex);
                 }else  if(isType=='note'){ 
                     $scope.billingNote = '';
                     $scope.countiesList[countyIndex]['schooles'][schoolIndex]['note'] = value;
                     if(value){
                      $scope.showGreen[id] = true;
                      $scope.showBrown[id] = false;
                     }else{
                      $scope.showGreen[id] = false;
                      $scope.showBrown[id] = true; 
                     }
                     $('#editDescription').modal('hide');
               }
              }
            },function(error){
               //  UtilityService.showToast('error','Something went wrong.');
            });
      };

      /*
      * Edit Billing Note
      */
      $scope.editBillingNote = function(countyIndex, schoolIndex, id,isType,value){
        $scope.districtNote = false;
        $scope.schoolNote = true;
        $scope.billingNote = "";
        billNoteData = {};
        billNoteData.countyIndex = countyIndex;
        billNoteData.schoolIndex = schoolIndex;
        billNoteData.id = id;
        billNoteData.isType = isType;
        billNoteData.value = value;
        if($scope.countiesList[countyIndex]['schooles'][schoolIndex]['note']){
         $scope.billingNote = angular.copy($scope.countiesList[countyIndex]['schooles'][schoolIndex]['note']);
        } 
        $('#editDescription').modal('show');
      };

      /*
      * Edit Billing Note
      */
      $scope.editDistrictBillingNote = function(countyIndex, schoolIndex, id,isType,value){
         
        $scope.districtNote = true;
        $scope.schoolNote = false;
        $scope.billingNote = "";
        billNoteData = {};
        billNoteData.countyIndex = countyIndex;
        billNoteData.schoolIndex = schoolIndex;
        billNoteData.id = id;
        billNoteData.isType = isType;
        billNoteData.value = value;
        if($scope.countiesList[countyIndex]['schooles'][schoolIndex]['note']){
           $scope.billingNote = angular.copy($scope.countiesList[countyIndex]['schooles'][schoolIndex]['note']);
        } 
        $('#editDescription').modal('show');
      };

      /*
      * update total billing amount
      */
      $scope.updateTotalBillingAmount = function(countyIndex, schoolIndex){
        var schoolData = $scope.countiesList[countyIndex]['schooles'];
        $scope.billingAmount[countyIndex] = 0;
         if(schoolData.length){ 
           angular.forEach(schoolData,function(result){
          
              $scope.billingAmount[countyIndex] += ((result.amount) ? result.amount : 0);// Add School and District Amount
           });
           
             $scope.billingAmount[countyIndex] += (($scope.countiesList[countyIndex].county_amount) ? $scope.countiesList[countyIndex].county_amount : 0);// Add County Amount
        } 
      };

      /*
       * Export billing csv
       */
       $scope.exportBillingCsv = function(){
        var i=0;
        var j=0;
        $scope.csvData =[];
        $scope.csvFieldsData = {fields:['County', 'District', 'School', 'Teachers', 'Billed', 'Paid', 'Amount', 'Note'],data:[]}; 
           angular.forEach($scope.countiesList,function(districts){
            
            $scope.csvData.push({
              'County': districts.county_name+' (County)', 
              'District': '',
              'School': '', 
              'Teachers': '', 
              'Billed': '', 
              'Paid': '', 
              'Amount': '$'+districts.county_amount, 
              'Note': ''
              });
            angular.forEach(districts.schooles,function(schools){ 
            $scope.csvData.push({
              'County': districts.county_name, 
              'District': schools.districtName,
              'School': schools.name, 
              'Teachers': schools.noOfTeachers, 
              'Billed': ((schools.isBilled) ? 'yes' : 'No'), 
              'Paid': ((schools.isPayed) ? 'yes' : 'No'), 
              'Amount': ((schools.amount) ? ('$'+schools.amount) : ('$'+0)), 
              'Note': schools.note
              });
         });
        });
        
       $scope.csvFieldsData.data = $scope.csvData;
        $scope.disableExportBtn = true;
        $scope.csvFieldsData.file_name = 'KRS_Billing';
        BillingService.exportBillingReport($scope.csvFieldsData)
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


      $scope.collapsTable = function(tableIndex){
        $('#county_table_'+tableIndex).toggle();
        $('#county_tab_toggle_'+tableIndex).toggleClass('fa fa-minus');
        $('#county_tab_toggle_'+tableIndex).toggleClass('fa fa-plus');
        //alert(tableIndex);
      }; 

    }]);
})();