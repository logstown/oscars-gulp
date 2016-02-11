(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .config(routerConfig);

    /** @ngInject */
    function routerConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainController',
                controllerAs: 'main'
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginController',
                controllerAs: 'login',
                resolve: {
                    // controller will not be loaded until $waitForAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    currentAuth: ['Auth', function(Auth) {
                        // $waitForAuth returns a promise so the resolve waits for it to complete
                        return Auth.$waitForAuth();
                    }]
                }
            })
            .state('picks', {
                url: '/picks',
                templateUrl: 'app/picks/picks.html',
                controller: 'PicksController',
                controllerAs: 'vm',
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    "currentAuth": ["Auth", function(Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireAuth();
                    }]
                }
            });

        $urlRouterProvider.otherwise('/');
    }

})();
