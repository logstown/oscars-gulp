(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log, $rootScope, $state, Auth) {

        $rootScope.url = 'https://oscars.firebaseio.com/';
        $rootScope.$on('$stateChangeError', function(event, next, previous, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === 'AUTH_REQUIRED') {
                $state.go('login');
            }
        });

        $rootScope.auth = Auth;
        $rootScope.auth.$onAuth(function(authData) {
            if (authData) {
                console.log('Logged in as:', authData.uid);
                $state.go('home');
            } else {
                console.log('Logged out');
                $state.go('login');
            }
        });

        $log.debug('runBlock end');
    }

})();
