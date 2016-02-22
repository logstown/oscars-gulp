(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('NavbarController', NavbarController);

    /* @ngInject */
    function NavbarController(Auth, User, $state, $modal) {
        var vm = this;
        vm.auth = Auth;
        vm.authData = false;
        vm.user = {};

        vm.logout = logout;
        vm.editProfile = editProfile;

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

        function editProfile() {
            $modal({
                templateUrl: 'app/profile/_editProfile.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
                controller: function(FBUrl, User, Auth) {
                    var profile = this;

                    profile.userNotLoaded = true;
                    profile.saveProfile = saveProfile;

                    activate();

                    function activate() {
                        profile.user = User(Auth.$getAuth().uid);

                        profile.user.$loaded()
                            .then(function() {
                                profile.userNotLoaded = false;
                            });
                    }

                    function saveProfile(hide) {
                        profile.user.fullName = profile.user.fullName || profile.user.firstName + ' ' + profile.user.lastName;

                        profile.user.$save()
                            .then(function() {
                                hide();
                            })
                    }
                }
            });
        }
    }
})();
