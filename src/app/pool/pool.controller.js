(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PoolController', PoolController);

    /** @ngInject */
    function PoolController(FBUrl, $stateParams, toastr, $state, currentAuth) {
        var ref = new Firebase(FBUrl);
        var poolRef = ref.child('pools').child($stateParams.id);

        if (!currentAuth.uid) {
            $state.go('login');
        }

        activate();

        function activate() {
            poolRef.once('value', processPoolToJoin)
        }

        function processPoolToJoin(snap) {
            if (snap.val() === null) {
                toastr.error('Invalid Pool ID');
            } else {
                poolRef.child('competitors').child(currentAuth.uid).set(true);
                ref.child('users').child(currentAuth.uid).child('pools').child($stateParams.id).set(true);

                toastr.success('You have been added to this Pool!')
            }

            $state.go('home');
        }
    }
})();
