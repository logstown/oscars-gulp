(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('AwardsService', AwardsService);

    /** @ngInject */
    function AwardsService($firebaseArray, $firebaseObject) {
        var awardsRef = firebase.database().ref('awards');
        var totalPoints = 0;
        var possiblePoints = 0;
        var awards = $firebaseArray(awardsRef);
        var latestAward = {
            winnerStamp: 0
        };

        awards.$watch(function(eventObj) {
            var award = awards[eventObj.key];

            totalPoints += award.points;

            if (award.winner === undefined) {
                return;
            }

            possiblePoints += award.points;

            if (award.winnerStamp > latestAward.winnerStamp) {
                latestAward = award;
            }
        });

        return {
            getTotalPoints: getTotalPoints,
            getLatestAward: getLatestAward,
            getAwards: getAwards,
            getPossiblePoints: getPossiblePoints
        };

        function getAwards() {
            return awards;
        }

        function getTotalPoints() {
            return totalPoints;
        }

        function getLatestAward() {
            return latestAward;
        }

        function getPossiblePoints() {
            return possiblePoints;
        }
    }
})();
