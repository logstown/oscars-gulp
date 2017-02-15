(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('Pool', Pool);

    /** @ngInject */
    function Pool($firebaseObject) {
        return function(id) {
            // create a reference to the users profile
            var ref = firebase.database().ref('pools').child(id);
            // return it as a synchronized object
            return $firebaseObject(ref);
        };
    }
})();
