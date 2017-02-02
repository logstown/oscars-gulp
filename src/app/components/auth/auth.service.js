(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('Auth', Auth);

    /** @ngInject */
    function Auth($firebaseAuth) {
        return $firebaseAuth();
    }
})();
