!(function(){
'use strict';
angular.module('firstFiveApp').config(function($stateProvider, $urlRouterProvider,$locationProvider) {
    
    $urlRouterProvider.otherwise('/');
    //$locationProvider.html5Mode({enabled: true,requireBase:false});

    $stateProvider.state('home', {
            url: '/',
            views:{
            	'content':{
            		 templateUrl: '/partials/auth/login.html',
                     controller: 'AuthController'
            	}
            },
            data:{
            	isAuthenticate: false
            }
           
        })
       .state('home.login', {
             url: '',
             views:{
            	'content':{
            		 templateUrl: '/partials/auth/login.html'
            	}
            },
            data:{
            	isAuthenticate: false
            } 
        })
       .state('admin', {
             url: '/admin',
             views:{
                'left': {
                     templateUrl: '/partials/includes/left.html'
                },
                'header': {
                     templateUrl: '/partials/includes/header.html'
                },
            	'content':{
            		 templateUrl: '/partials/dashboard/dashboard.html',
                     controller: 'DashboardController'
            	},
                'footer': {
                     templateUrl: '/partials/includes/footer.html'
                }
            },
            data:{
            	isAuthenticate: true
            }    
        })
        .state('admin.dashboard', {
             url: '/dashboard',
             views:{
                'content@':{
                     templateUrl: '/partials/dashboard/dashboard.html',
                     controller: 'DashboardController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
        .state('admin.teachers', {
             url: '/teachers',
             views:{
                'content@':{
                     templateUrl: '/partials/teacher/teachers.html',
                     controller: 'TeacherController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
        .state('admin.reports', {
             url: '/reports',
             views:{
                'content@':{
                     templateUrl: '/partials/report/reports.html',
                     controller: 'ReportController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
        .state('admin.billing', {
             url: '/billing',
             views:{
                'content@':{
                     templateUrl: '/partials/billing/billing.html',
                     controller: 'BillingController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
        .state('admin.management', {
             url: '/management',
             views:{
                'content@':{
                     templateUrl: '/partials/management/managements.html',
                     controller: 'ManagementController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
         .state('admin.managementDestrict', {
             url: '/manage/districtes/:id',
             views:{
                'content@':{
                     templateUrl: '/partials/management/districtes.html',
                     controller: 'ManagementController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        })
          .state('admin.managementSchooles', {
             url: '/manage/schooles/:id/county/:cid',
             views:{
                'content@':{
                     templateUrl: '/partials/management/schooles.html',
                     controller: 'ManagementController'
                },
            },
            data:{
                isAuthenticate: true
            }    
        });

      
        
});


angular.module('firstFiveApp').run(['$rootScope', '$state','$location', 'UtilityService', function($rootScope, $state, $location, UtilityService) {
    $rootScope.$on('$stateChangeStart', function(event, toState) {
      var loggedInUser = UtilityService.getLocalStorage('user');

        if (loggedInUser && !toState.data.isAuthenticate) { 
           // event.preventDefault();
            $location.path('admin/dashboard');
        } 

        if (!loggedInUser && toState.data.isAuthenticate) { 
            //event.preventDefault();
            $location.path('/');
        } 

         
    });
}]);

 angular.module('firstFiveApp').constant('appConstant',{
         'apiUrl':  window.location.protocol + "//" + window.location.host + "/",
         'baseUrl':  window.location.protocol + "//" + window.location.host + "/"
       });
})();