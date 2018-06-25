/**
 * Created date 19/12/2016.
 */
!(function() {
    'use strict';

    angular.module('firstFiveApp').filter('createddate', function() {
          return function( input, userAccessLevel) {
            var date =  new Date(input).toISOString().replace(/T/, ' ').replace(/\..+/, '');
             
            return date;
          };
        }); 
            

})();