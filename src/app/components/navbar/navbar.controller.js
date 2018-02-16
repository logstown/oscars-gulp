(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('NavbarController', NavbarController);

    /* @ngInject */
    function NavbarController(Auth, User, $state, $modal) {
        var vm = this;
        vm.user = null;

        vm.logout = logout;
        vm.editProfile = editProfile;
        vm.getAvatarUrl = getAvatarUrl;

        activate();

        ////////////////

        function activate() {
            // any time auth status updates, add the user data to scope
            Auth.$onAuthStateChanged(function(authData) {
                if (authData) {
                    vm.user = User(authData.uid);
                } else {
                    vm.user = null;
                    $state.go('login');
                }
            });
        }

        function logout() {
            Auth.$signOut();
        }

        function getAvatarUrl() {
            if(vm.user) {
                return 'avatars/' + vm.user.uid
            } else {
                return '';
            }
        }

        function editProfile() {
            $modal({
                templateUrl: 'app/profile/_editProfile.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
                controller: ['User', 'Auth', function(User, Auth) {
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
                        profile.user.$save()
                            .then(function() {
                                hide();
                            })
                    }
                }]
            });
        }
    }
})();
