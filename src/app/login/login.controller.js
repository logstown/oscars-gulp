(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('LoginController', LoginController);

    /** @ngInject */
    function LoginController(FBUrl, $firebaseObject, $state, Auth, currentAuth, $rootScope) {
        var vm = this;

        vm.login = login;

        activate();

        function activate() {
            if (currentAuth !== null) {
                $state.go('home');
            }
        }

        function login(provider) {
            Auth.$authWithOAuthPopup(provider)
                .then(function(result) {
                    var ref = new Firebase(FBUrl + 'users/' + result.auth.uid);
                    var user = $firebaseObject(ref);

                    user.$loaded()
                        .then(function() {
                            var route = {
                                state: 'home',
                                params: {}
                            };

                            if ($rootScope.intendedRoute) {
                                route = $rootScope.intendedRoute
                                $rootScope.intendedRoute = undefined;
                            }

                            if (user.$value === null) {
                                user.$value = getProfile(result);
                                user.$save();
                            }

                            $state.go(route.state, route.params);
                        });
                });
        }

        function getProfile(result) {
            var profile = result[result.provider].cachedUserProfile;

            switch (result.provider) {
                case 'facebook':
                    return {
                        firstName: profile.first_name,
                        lastName: profile.last_name,
                        fullName: profile.name,
                        link: profile.link,
                        id: profile.id,
                        locale: profile.locale,
                        gender: profile.gender,
                        picture: profile.picture.data.url
                    };

                case 'google':
                    return {
                        firstName: profile.given_name,
                        lastName: profile.family_name,
                        fullName: profile.name,
                        link: profile.link,
                        id: profile.id,
                        locale: profile.locale,
                        gender: profile.gender,
                        picture: profile.picture
                    };

                case 'twitter':
                    return {
                        screenName: profile.screen_name,
                        fullName: profile.name,
                        link: profile.url,
                        id: profile.id,
                        locale: profile.lang,
                        picture: profile.profile_image_url
                    }

                case 'github':
                    return {
                        screenName: profile.login,
                        fullName: profile.name,
                        link: profile.url,
                        id: profile.id,
                        picture: profile.avatar_url
                    }
            }
        }
    }
})();
