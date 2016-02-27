(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('AwardsService', AwardsService);

    /** @ngInject */
    function AwardsService(FBUrl, $firebaseArray, $firebaseObject) {
        var ref = new Firebase(FBUrl);
        var awardsRef = ref.child('awards');

        return {
            onChange: onChange,
            get: get
        };

        function get() {
            // return awards;
        }

        function onChange(cb) {
            var awards = $firebaseArray(awardsRef);
            return awards.$watch(function(eventObj) {
                var awardRef = awardsRef.child(eventObj.key);
                // awardRef.child('winner').once('value', function(winnerSnap) {
                //     if (winnerSnap.val() !== null) {
                //         cb(eventObj.key, winnerSnap.val(), $firebaseObject(awardRef.child('points')))
                //     }
                // });

                var award = $firebaseObject(awardRef);
                award.$loaded()
                    .then(function() {
                        if (award.winner !== null) {
                            cb(award)
                        }
                    })
            });
        }
    }
})();
