(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PicksArray', PicksArray);

    /** @ngInject */
    function PicksArray($firebaseArray) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('picks').child(id);
            // return it as a synchronized object
            return $firebaseArray(ref);
        };
    }
})();
