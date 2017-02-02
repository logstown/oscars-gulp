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
                views: {
                    '': {
                        templateUrl: 'app/main/main.html',
                        controller: 'MainController',
                        controllerAs: 'vm',
                    },
                    'beforeStart@home': {
                        templateUrl: 'app/main/before-start/before-start.html',
                        controller: 'BeforeStartController',
                        controllerAs: 'vm'
                    },
                    'afterStart@home': {
                        templateUrl: 'app/main/after-start/after-start.html',
                        controller: 'AfterStartController',
                        controllerAs: 'vm'
                    }
                },
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    currentAuth: ['Auth', function(Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                    }]
                }
            })
            .state('login', {
                url: '/login',
                templateUrl: 'app/login/login.html',
                controller: 'LoginController',
                controllerAs: 'vm',
                resolve: {
                    // controller will not be loaded until $waitForAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    currentAuth: ['Auth', function(Auth) {
                        // $waitForAuth returns a promise so the resolve waits for it to complete
                        return Auth.$waitForSignIn();
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
                    currentAuth: ['Auth', function(Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                    }]
                }
            })
            .state('pool', {
                url: '/pool/:id',
                controller: 'PoolController',
                controllerAs: 'vm',
                resolve: {
                    // controller will not be loaded until $requireAuth resolves
                    // Auth refers to our $firebaseAuth wrapper in the example above
                    currentAuth: ['Auth', function(Auth) {
                        // $requireAuth returns a promise so the resolve waits for it to complete
                        // If the promise is rejected, it will throw a $stateChangeError (see above)
                        return Auth.$requireSignIn();
                    }]
                }
            })
            .state('about', {
                url: '/about',
                templateUrl: 'app/about/about.html'
            });

        $urlRouterProvider.otherwise('/');
    }

})();
