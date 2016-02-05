(function() {
	'use strict';

	angular
		.module('oscarsNew')
		.factory('User', User);

	/** @ngInject */
	function User($rootScope, $firebaseObject) {
		return function(id) {
			// create a reference to the users profile
			var ref = new Firebase($rootScope.url + 'users/').child(id);
			// return it as a synchronized object
			return $firebaseObject(ref);
		};
	}
})();
