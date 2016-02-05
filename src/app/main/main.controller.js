(function() {
	'use strict';

	angular
		.module('oscarsNew')
		.controller('MainController', MainController);

	/** @ngInject */
	function MainController($scope, $rootScope, $firebase, $location, $timeout, $modal, Auth, User) {
		var vm = this;

		vm.logout = function() {
			Auth.$unauth();
		}
	}
})();
