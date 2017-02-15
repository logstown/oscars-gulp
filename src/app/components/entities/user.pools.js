(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('UserPools', UserPools);

    /** @ngInject */
    function UserPools($firebaseArray) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('user-pools').child(id);
            // return it as a synchronized Array
            return $firebaseArray(ref);
        };
    }
})();
