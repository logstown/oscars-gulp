(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PoolUsers', PoolUsers);

    /** @ngInject */
    function PoolUsers($firebaseArray) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('pool-users').child(id);
            // return it as a synchronized Array
            return $firebaseArray(ref);
        };
    }
})();
