(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, Auth, currentAuth, $rootScope) {
        var vm = this;

        vm.login = login;

        activate();

        function activate() {
            if (currentAuth !== null) {
                $state.go('home');
            }
        }

        function login(provider) {
            Auth.$signInWithPopup(provider)
                .then(function(result) {
                    var providerData = angular.copy(result.user.providerData[0])

                    providerData.uid = result.user.uid;

                    firebase.database()
                        .ref('users')
                        .child(result.user.uid)
                        .set(providerData);

                    var route = $rootScope.intendedRoute || { state: 'home', params: {} };
                    $rootScope.intendedRoute = undefined;

                    $state.go(route.state, route.params);
                });
        }

    }
})();
