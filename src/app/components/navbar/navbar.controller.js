(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('NavbarController', NavbarController);

    /* @ngInject */
    function NavbarController(Auth, User) {
        var vm = this;
        vm.auth = Auth;
        vm.authData = false;
        vm.user = {};

        vm.logout = logout;

        activate();

        ////////////////

        function activate() {
            // any time auth status updates, add the user data to scope
            vm.auth.$onAuth(function(authData) {
                vm.authData = authData;
                if (vm.authData) {
                    vm.user = User(authData.uid)
                }
            });
        }

        function logout() {
            vm.auth.$unauth();
        }
    }
})();
