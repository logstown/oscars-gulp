(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PicksObject', PicksObject);

    /** @ngInject */
    function PicksObject($firebaseObject) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('picks').child(id);
            // return it as a synchronized object
            return $firebaseObject(ref);
        };
    }
})();
