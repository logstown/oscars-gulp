(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('Awards', Awards);

    /** @ngInject */
    function Awards($firebaseArray) {
        return function() {
            // create a reference to the users profile
            var ref = firebase.database().ref('awards');
            // return it as a synchronized Array
            return $firebaseArray(ref);
        };
    }
})();
