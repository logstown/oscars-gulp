(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController($state, Auth, currentAuth, $rootScope, User, $firebaseStorage) {
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

                    var user = User(result.user.uid);

                    user.$loaded()
                        .then(function() {
                            if (user.$value === null) {
                                firebase.database()
                                    .ref('users')
                                    .child(result.user.uid)
                                    .set(providerData)
                            }

                            var storageRef = firebase.storage().ref("avatars/" + result.user.uid);

                            fetch(providerData.photoURL)
                                .then(function(res) {
                                    return res.blob()
                                })
                                .then(function(blob) {
                                    $firebaseStorage(storageRef).$put(blob, {contentType: "image/jpg"})
                                });

                            var route = $rootScope.intendedRoute || { state: 'home', params: {} };
                            $rootScope.intendedRoute = undefined;

                            $state.go(route.state, route.params);
                        })

                });
        }

    }
})();
