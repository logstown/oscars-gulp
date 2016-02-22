(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PoolController', PoolController);

    /** @ngInject */
    function PoolController(FBUrl, $stateParams, toastr, $state, currentAuth) {
        var ref = new Firebase(FBUrl);
        var poolRef = ref.child('pools').child($stateParams.id);

        activate();

        function activate() {
            poolRef.once('value', processPoolToJoin)
        }

        function processPoolToJoin(snap) {
            if (snap.val() === null) {
                toastr.error('Invalid Pool ID');
                $state.go('home');
            } else {
                var oldPoolIdRef = ref.child('users').child(currentAuth.uid).child('poolId');
                oldPoolIdRef.once('value', processOldPool)
            }
        }

        function processOldPool(snap) {
            var oldPoolId = snap.val();

            if (oldPoolId) {
                if (oldPoolId === $stateParams.id) {
                    $state.go('home');
                } else if (confirm('Are you sure you want to abandon your other pool and join this one?')) {
                    ref.child('pools').child(oldPoolId).child('competitors').child(currentAuth.uid).remove();
                    addUserToPool();
                } else {
                    toastr.info('Keeping original Pool')
                    $state.go('home');
                }
            } else {
                addUserToPool();
            }
        }

        function addUserToPool() {
            poolRef.child('competitors').child(currentAuth.uid).set(true);
            ref.child('users').child(currentAuth.uid).child('poolId').set($stateParams.id);

            toastr.success('You have been added to this Pool!')
            $state.go('home');
        }
    }
})();
