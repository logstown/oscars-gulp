(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('AwardsService', AwardsService);

    /** @ngInject */
    function AwardsService(Awards) {
        var totalPoints = 0;
        var possiblePoints = 0;
        var awards = Awards();
        var latestAward = {
            winnerStamp: 0
        };

        awards.$watch(function(eventObj) {
            var award = awards[eventObj.key];

            possiblePoints = _.chain(awards)
                .filter(function(award) {
                    return award.winner !== undefined;
                })
                .sumBy('points')
                .value() || 0;

            if (eventObj.event === 'child_added') {
                totalPoints += award.points;
            }

            if (award.winnerStamp > latestAward.winnerStamp) {
                latestAward = award;
            }
        });

        return {
            getTotalPoints: getTotalPoints,
            getLatestAward: getLatestAward,
            getPossiblePoints: getPossiblePoints
        };

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
