(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('AfterStartController', AfterStartController);

    /** @ngInject */
    function AfterStartController(Auth, $firebaseArray) {
        var vm = this;
        var ref = firebase.database().ref();
        var currentUid = Auth.$getAuth().uid;

        var userPoolsRef = ref.child('user-pools').child(currentUid)
        vm.userPools = $firebaseArray(userPoolsRef);
    }
})();
