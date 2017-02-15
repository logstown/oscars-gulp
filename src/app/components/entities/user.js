(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('User', User);

    /** @ngInject */
    function User($firebaseObject) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('users').child(id);
            // return it as a synchronized object
            return $firebaseObject(ref);
        };
    }
})();
