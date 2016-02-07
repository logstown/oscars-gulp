(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('NavbarController', NavbarController);

    NavbarController.$inject = ['Auth', 'User', '$modal'];

    /* @ngInject */
    function NavbarController(Auth, User, $modal) {
        var vm = this;
        vm.auth = Auth;
        vm.authData = false;
        vm.user = {};

        vm.logout = logout
        vm.createNewPool = createNewPool;

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

        function createNewPool() {
            $modal({
                templateUrl: 'app/pool/_addPool.html',
                show: true,
                controller: function() {
                    var vm = this;

                    vm.newPool = {
                        allowOthers: false
                    };

                    vm.create = create;

                    function create() {
                        console.log(vm.newPool)
                    }
                },
                controllerAs: 'vm',
                animation: 'am-fade-and-scale'
            });
        }
    }
})();
