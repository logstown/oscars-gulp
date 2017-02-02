(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('AfterStartController', AfterStartController);

    /** @ngInject */
    function AfterStartController(Auth, User, $firebaseArray, $firebaseObject) {
        var vm = this;
        var ref = firebase.database().ref();



        var user = User(Auth.$getAuth().uid);

        user.$loaded()
            .then(function() {
                var userPoolsRef = ref.child('users').child(user.uid).child('pools');

                var pools = $firebaseArray(userPoolsRef);

                pools.$loaded()
                    .then(function() {
                        vm.pools = _.map(pools, function(poolIdx) {
                            var poolRef = ref.child('pools').child(poolIdx.$id);
                            return $firebaseObject(poolRef);
                        })
                    })
            })
    }
})();
