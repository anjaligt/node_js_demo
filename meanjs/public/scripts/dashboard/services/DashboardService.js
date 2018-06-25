!(function(){
	angular.module('firstFiveApp').service('DashboardService',['$http','appConstant',function($http,appConstant){
     this.emailForm = {
        to:'',
        cc:'',
        bcc:'',
        subject:'',
        content:''
     };
  

      /*Teacher Add api*/
     this.exportPdf = function(data){ 
        return $http.post(appConstant.apiUrl+'export_to_pdf',data);
     }
     
      /*Get Dashboard Report api*/
     this.getDashboardreport = function(data){ 
        return $http.get(appConstant.apiUrl+'reportsDashboard');
     }

     /*Get Dashboard Report api*/
     this.reportTeacherParticipation = function(data){ 
        return $http.get(appConstant.apiUrl+'reports_teacher_participation');
     }

      /*Get Teacher Assesment Completion api*/
     this.teacherDashboardCharts = function(data){ 
        return $http.post(appConstant.apiUrl+'teachers_dashboard_charts',data);
     }
     
     /*Get county billing api*/
     this.getAllBillingCounties = function(data){ 
        return $http.post(appConstant.apiUrl+'billing',data);
     }

     /*Get all county api*/
     this.getAllCounties = function(data){   
        var queryString = '';
        if(data.from_date && data.to_date){
          //queryString = '?from_date='+data.from_date+'&to_date='+data.to_date;
        }
        return $http.get(appConstant.apiUrl+'all_counties'+queryString);
     }

     /*Get county districts api*/
     this.getDistrictsByCountyIds = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/get_districts_by_county_ids',data)
     }

     /*Get district schooles api*/
     this.getSchoolesByDistrictIds = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/get_schooles_by_district_ids',data)
     }

     /*Get students by school id api*/
     this.getTeachersBySchoolIds = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/get_teachers_by_school_ids',data)
     }

     /*County Teachers PDF report api*/
     this.countyTeacherPdfReport = function(data){ 
        return $http.post(appConstant.apiUrl+'detailed_report_one',data)
     }

     /*County Students PDF report api*/
     this.countyStudentPdfReport = function(data){ 
        return $http.post(appConstant.apiUrl+'detailed_report_two',data)
     }

      /*Students list api*/
     this.getAllStudents = function(data){ 
        return $http.post(appConstant.apiUrl+'reports_download',data)
     };

     /*Student CSV Export  api*/
     this.exportReport = function(data){ 
        return $http.post(appConstant.apiUrl+'v1/exportTeachersReport',data)
     };

     /*Export county third report api*/
     this.exportThirdReport = function(data){ 
        return $http.post(appConstant.apiUrl+'detailed_report_third',data);
     }

     /*Export county fourth report api*/
     this.exportFourthReport = function(data){ 
        return $http.post(appConstant.apiUrl+'detailed_report_fourth',data);
     }
     
     /* Get literacy numeracy and social*/
     this.getLiteracyNumeracyAndSocial = function(data){ 
        return $http.post(appConstant.apiUrl+'get_literacy_numeracy_social',data);
     } 

      /* Get Dashboard tools Api */
     this.getDashboardTools = function(data){ 
        return $http.get(appConstant.apiUrl+'dashboard_tools');
     } 

      /*Export Green Yello Red PDF report api*/
     this.exportGreenYelloRedPdfReport = function(data){ 
        return $http.post(appConstant.apiUrl+'export_green_yello_red_pdf_report',data)
     };

     /*Get School Students by percentage api*/
     this.getSchoolStudentsByPercentage = function(data){ 
        return $http.post(appConstant.apiUrl+'get_school_students_by_percent',data)
     };

     /*Sent Student tools report by email api*/
     this.sendStudentsReportByEmail = function(data){ 
        return $http.post(appConstant.apiUrl+'send_students_report_by_email',data)
     };

      /*Get county districts and schools api*/
     this.getCountyDistrictsAndSchools = function(data){ 
        return $http.post(appConstant.apiUrl+'counties_districts_schools_count',data)
     }
	}]);
})();