(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PoolController', PoolController);

    /** @ngInject */
    function PoolController($stateParams, toastr, $state, currentAuth) {
        var ref = firebase.database().ref();
        var poolRef = ref.child('pools').child($stateParams.id);

        if (!currentAuth.uid) {
            $state.go('login');
        }

        activate();

        function activate() {
            poolRef.once('value', processPoolToJoin);
        }

        function processPoolToJoin(snap) {
            if (snap.val() === null) {
                toastr.error('Invalid Pool ID');
            } else {
                var now = new Date().getTime();
                var competitorRef = poolRef.child('competitors').child(currentAuth.uid);

                competitorRef.once('value', function(competitorSnap) {
                    if (competitorSnap.val() === null) {
                        competitorRef.set(now);
                        ref.child('users').child(currentAuth.uid).child('pools').child($stateParams.id).set(now);

                        toastr.success('You have been added to this Pool!')
                    }
                })
            }

            $state.go('home');
        }
    }
})();
