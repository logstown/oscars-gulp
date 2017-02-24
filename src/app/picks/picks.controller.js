(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PicksController', PicksController);

    /** @ngInject */
    function PicksController($scope, Awards, PicksObject, currentAuth, TimeService, $document, $modal, User, PicksService, $state, UserPools, Pool, PoolUsers, $q) {
        var ADMIN_GOOGLE_UID = 'google:106090281405764589476';
        var ADMIN_FACEBOOK_UID = 'facebook:10101440252179991';
        var ADMIN_TWITTER_UID = 'twitter:21528048';
        var SCROLL_DURATION = 1000;

        var currentUserId = currentAuth.uid;
        var informedUser = false;
        var ref = firebase.database().ref();

        $scope.nomineeClicked = nomineeClicked;
        $scope.isAfterOscarStart = TimeService.isAfterOscarStart;
        $scope.validateAward = validateAward;
        $scope.validateNominee = validateNominee;
        $scope.pickWinner = pickWinner;
        $scope.isAuthorized = isAuthorized;
        $scope.getVoters = getVoters;

        activate();

        function activate() {
            if (!currentUserId) {
                $state.go('login');
            }

            $scope.awards = Awards();

            var picks = PicksObject(currentUserId);
            picks.$bindTo($scope, 'picks');

            if ($scope.isAfterOscarStart) {
                var userPools = UserPools(currentUserId);

                userPools.$loaded()
                    .then(function() {
                        $scope.userPools = _.map(userPools, function(pool) {
                            return Pool(pool.$id)
                        });

                        return $scope.userPools[0].$loaded()

                    })
                    .then(function() {
                        $scope.userPool = $scope.userPools[0];
                        userPoolChanged();
                    })
            }
        }

        function userPoolChanged() {
            var poolUsers = PoolUsers($scope.userPool.$id);

            poolUsers.$loaded()
                .then(function() {
                    $scope.poolUsers = _.chain(poolUsers)
                        .map(function(user) {
                            return {
                                picks: PicksObject(user.$id),
                                info: User(user.$id)
                            }
                        })
                        .value();

                    $scope.awards.$loaded()
                        .then(function() {
                            var promises = _.map($scope.poolUsers, function(user) {
                                return user.picks.$loaded();
                            });

                            return $q.all(promises)

                        })
                        .then(function() {
                            $scope.voters = [];

                            angular.forEach($scope.awards, function(award) {
                                $scope.voters[award.$id] = _.groupBy($scope.poolUsers, function(user) {
                                    var i = Number(award.$id);
                                    var thing = user.picks[i];
                                    return thing;
                                })
                            })
                        })

                })
        }

        function nomineeClicked(awardIdx) {
            if (PicksService.getSize($scope.picks) === $scope.awards.length && !informedUser) {
                $modal({
                    title: 'All Done!',
                    content: 'Come back <strong>' + moment(TimeService.getOscarStart()).calendar() + '</strong> during the ceremony to watch the scores update LIVE!',
                    show: true,
                    animation: 'am-fade-and-scale',
                    html: true
                });

                informedUser = true;
            } else {
                scrollToNext(awardIdx);
            }
        }

        function pickWinner(award, nomineeIdx) {
            if (isAuthorized() && TimeService.isAfterOscarStart()) {
                $scope.awards[award.$id].winner = nomineeIdx;
                $scope.awards[award.$id].winnerStamp = firebase.database.ServerValue.TIMESTAMP;
                $scope.awards.$save(award);
            }
        }

        function isAuthorized() {
            return currentUserId === ADMIN_FACEBOOK_UID || currentUserId === ADMIN_GOOGLE_UID || currentUserId === ADMIN_TWITTER_UID;
        }

        function validateAward(awardIdx) {
            if (awardCantBeValidated(awardIdx)) {
                return;
            }

            return Number($scope.picks[awardIdx]) === $scope.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function validateNominee(awardIdx, nomineeIdx) {
            if (awardCantBeValidated(awardIdx) || Number($scope.picks[awardIdx]) !== nomineeIdx) {
                return;
            }

            return nomineeIdx === $scope.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function awardCantBeValidated(awardIdx) {
            return !$scope.picks[awardIdx] || $scope.awards[awardIdx].winner === undefined || !$scope.isAfterOscarStart();
        }

        function scrollToNext(awardIdxClicked) {
            var nextAwards = _.omitBy($scope.picks, function(nomineeIdx, awardIdx) {
                return awardIdx <= awardIdxClicked;
            })

            var lastIdx = awardIdxClicked;
            _.forEach(nextAwards, function(nomineeIdx, awardIdx) {
                awardIdx = Number(awardIdx)

                if (isNaN(awardIdx) || awardIdx - lastIdx > 1) {
                    return false;
                }

                lastIdx = awardIdx;
            });

            if (lastIdx === $scope.awards.length - 1) {
                return;
            }

            var nextAward = angular.element(document.getElementById('award-' + (lastIdx + 1)));
            $document.scrollToElementAnimated(nextAward, 0, SCROLL_DURATION);
        }

        function getVoters(awardI, nomI) {
            return $scope.voters[awardI][nomI];
        }
    }
})();
