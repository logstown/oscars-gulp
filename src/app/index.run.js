(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .run(runBlock);

    /** @ngInject */
    function runBlock($log, $rootScope, $state) {
        $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
            // We can catch the error thrown when the $requireAuth promise is rejected
            // and redirect the user back to the home page
            if (error === 'AUTH_REQUIRED') {
                $rootScope.intendedRoute = {
                    state: toState.name,
                    params: toParams
                };

                $state.go('login')
            }
        });

        $log.debug('runBlock end');
    }
})();
