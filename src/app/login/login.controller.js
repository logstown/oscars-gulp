(function() {
	'use strict';

	angular
		.module('oscarsNew')
		.controller('LoginController', LoginController);

	/** @ngInject */
	function LoginController($rootScope, $firebaseObject, $state, Auth, currentAuth) {
		var vm = this;

		vm.login = login;

		activate();

		function activate() {
			if (currentAuth !== null) {
				$state.go('/');
			}
		}

		function login(provider) {
			Auth.$authWithOAuthPopup(provider)
				.then(function(result) {
					var ref = new Firebase($rootScope.url + 'users/' + result.auth.uid);
					var user = $firebaseObject(ref);

					user.$loaded()
						.then(function(data) {
							if (!data.$value) {
								user.$value = getProfile(provider);
								user.$save();
							}
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
					}
			}
		}
	}
})();
