(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PicksController', PicksController);

    /** @ngInject */
    function PicksController($rootScope, $firebaseArray) {
        var vm = this;

        activate();

        function activate() {

            var ref = new Firebase($rootScope.url);
            vm.awards = $firebaseArray(ref.child('awards'));
        }
    }
})();
