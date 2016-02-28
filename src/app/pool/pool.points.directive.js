(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('poolPoints', poolPoints);

    /** @ngInject */
    function poolPoints(FBUrl, User, $firebaseObject, AwardsService, Auth, toastr) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/pool/_poolPoints.html',
            scope: {
                pool: '='
            },
            link: link
        };

        return directive;

        /** @ngInject */
        function link(scope) {
            var ref = new Firebase(FBUrl);

            scope.possiblePoints = 0;
            scope.users = [];
            scope.doneLoading = false;

            scope.getProgressWidth = getProgressWidth;
            scope.getProgressBarColor = getProgressBarColor;
            scope.getBadgeLeft = getBadgeLeft;

            activate();

            function activate() {

                scope.pool.$loaded()
                    .then(function() {
                        scope.users = getUsers(scope.pool.competitors);
                    });

                AwardsService.onChange(updateUserScores);

                // AwardsService.getTotalPoints()
                //     .then(function(total) {
                //         scope.totalPoints = total;
                //     })
            }

            function getUsers(competitors) {
                return _.map(competitors, function(dateJoined, uid) {
                    var user = User(uid);

                    user.$loaded()
                        .then(function() {
                            user.picks = $firebaseObject(ref.child('picks').child(uid))
                            user.score = 0;
                        })

                    return user;
                })
            }

            function updateUserScores(award, event) {
                scope.possiblePoints += award.points;

                angular.forEach(scope.users, function(user) {
                    user.$loaded()
                        .then(function() {
                            return user.picks.$loaded();
                        })
                        .then(function() {
                            scope.doneLoading = true;

                            var correct = Number(user.picks[award.$id]) === Number(award.winner)

                            if (correct) {
                                user.score += award.points;
                            }

                            if (user.uid === Auth.$getAuth().uid && event === 'child_changed') {
                                if (correct) {
                                    toastr.success('You got it Right!');
                                } else {
                                    toastr.error('Better luck on the next one.')
                                }
                            }
                        })
                })
            }

            function getProgressWidth(score) {
                var width = score ? (score / scope.possiblePoints) * 100 : '';

                return width;
            }

            function getBadgeLeft(score) {
                return getProgressWidth(score) - 8;
            }

            function getProgressBarColor(user) {
                var latestAward = AwardsService.getLatestAward();

                if (Number(user.picks[latestAward.$id]) === Number(latestAward.winner)) {
                    return 'progress-bar-success';
                } else {
                    return 'progress-bar-danger'
                }
            }
        }
    }

})();
