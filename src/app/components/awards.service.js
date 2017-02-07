(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('AwardsService', AwardsService);

    /** @ngInject */
    function AwardsService($firebaseArray, $firebaseObject) {
        var awardsRef = firebase.database().ref.child('awards');
        var latestAward = {};

        return {
            onChange: onChange,
            getTotalPoints: getTotalPoints,
            getLatestAward: getLatestAward,
            getAwards: getAwards
        };

        function getAwards() {
            return $firebaseArray(awardsRef);
        }

        function getTotalPoints() {
            return getAwards().$loaded()
                .then(function() {
                    return _.sumBy(awards, 'points')
                })
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
                        if (award.winner !== undefined) {
                            cb(award, eventObj.event);

                            if (award.winnerStamp > latestAward.winnerStamp || _.isEmpty(latestAward)) {
                                latestAward = award;
                            }
                        }
                    })
            });
        }

        function getLatestAward() {
            return latestAward;
        }
    }
})();
