(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PoolController', PoolController);

    /** @ngInject */
    function PoolController(FBUrl, $firebaseObject, $stateParams, toastr, $state) {
        var vm = this;
        var ref = new Firebase(FBUrl);

        activate();

        function activate() {
            vm.pool = $firebaseObject(ref.child('pools').child($stateParams.id));

            vm.pool.$loaded()
                .then(function() {
                    if (vm.pool.$value === null) {
                        toastr.error('Error', 'Invalid Pool ID');
                        $state.go('home');
                    }
                })
        }
    }
})();
