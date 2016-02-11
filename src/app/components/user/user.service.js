(function() {
	'use strict';

	angular
		.module('oscarsNew')
		.factory('User', User);

	/** @ngInject */
	function User(FBUrl, $firebaseObject) {
		return function(id) {
			// create a reference to the users profile
			var ref = new Firebase(FBUrl + 'users/').child(id);
			// return it as a synchronized object
			return $firebaseObject(ref);
		};
	}
})();
