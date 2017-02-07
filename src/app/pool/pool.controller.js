(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PoolController', PoolController);

    /** @ngInject */
    function PoolController($stateParams, toastr, $state, currentAuth, PoolService) {
        var ref = firebase.database().ref();
        var poolId = $stateParams.id;

        if (!currentAuth.uid) {
            $state.go('login');
        }

        activate();

        function activate() {
            ref.child('pools')
                .child(poolId)
                .once('value')
                .then(processPoolToJoin);
        }

        function processPoolToJoin(poolSnap) {
            if (poolSnap.exists()) {
                ref.child('pool-users')
                    .child(poolId)
                    .child(currentAuth.uid)
                    .once('value')
                    .then(function(poolUserSnap) {
                        if (!poolUserSnap.exists()) {
                            PoolService.addUser(currentAuth.uid, poolId)
                                .then(function() {
                                    toastr.success('You have been added to ' + poolSnap.val().name)

                                    $state.go('home');
                                })

                        } else {
                            $state.go('home');
                        }

                    })
            } else {
                toastr.error('Invalid Pool ID');
                $state.go('home');
            }

        }
    }
})();
