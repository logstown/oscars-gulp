(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('poolPoints', poolPoints);

    /** @ngInject */
    function poolPoints(User, Pool, Awards, AwardsService, Auth, toastr, $modal, PicksObject, PoolUsers) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/pool/_poolPoints.html',
            scope: {
                poolId: '='
            },
            link: link
        };

        return directive;

        /** @ngInject */
        function link(scope) {
            var ref = firebase.database().ref();
            var awards = Awards();
            var competitors = PoolUsers(scope.poolId);

            scope.pool = Pool(scope.poolId);
            scope.competitors = [];
            scope.picks = {};

            scope.getProgressWidth = getProgressWidth;
            scope.getProgressBarColor = getProgressBarColor;
            scope.getBadgeLeft = getBadgeLeft;
            scope.itsOver = itsOver;
            scope.isWinner = isWinner;
            scope.isEliminated = isEliminated;
            scope.isAdmin = isAdmin;
            scope.getSuperlatives = getSuperlatives;

            activate();

            function activate() {

                competitors.$loaded()
                    .then(function() {
                        scope.competitors = getCompetitors(competitors);
                    });

                awards.$watch(function(eventObj) {
                    var award = awards[eventObj.key];

                    if (award.winner !== undefined) {
                        updateScores(award);
                    }
                })
            }

            function getCompetitors(competitors) {
                return _.map(competitors, function(competitor) {
                    competitor.info = User(competitor.$id);
                    competitor.picks = PicksObject(competitor.$id);
                    competitor.score = 0;

                    return competitor
                })
            }

            function updateScores(award) {
                competitors.$loaded()
                    .then(function() {
                        angular.forEach(scope.competitors, function(competitor) {
                            competitor.picks.$loaded()
                                .then(function() {
                                    if (Number(competitor.picks[award.$id]) === Number(award.winner)) {
                                        competitor.score += award.points;
                                    }

                                    if (itsOver()) {
                                        scope.winners = _.filter(scope.competitors, { score: getHighestScore() });
                                    }
                                })
                        })
                    })
            }

            function getProgressWidth(user) {
                var possiblePoints = AwardsService.getPossiblePoints();

                if (possiblePoints) {
                    return (user.score / possiblePoints) * 100;
                } else {
                    return 0;
                }
            }

            function getBadgeLeft(user) {
                return getProgressWidth(user) - 8;
            }

            function getProgressBarColor(user) {
                var latestAward = AwardsService.getLatestAward();

                if (Number(user.picks[latestAward.$id]) === latestAward.winner) {
                    return 'progress-bar-success';
                } else {
                    return 'progress-bar-danger'
                }
            }

            function itsOver() {
                return AwardsService.getPossiblePoints() === AwardsService.getTotalPoints();
            }

            function isWinner(user) {
                return itsOver() && user.score === getHighestScore();
            }

            function getHighestScore() {
                return _.maxBy(scope.competitors, 'score').score;
            }

            function isEliminated(user) {
                var pointsRemaining = AwardsService.getTotalPoints() - AwardsService.getPossiblePoints();

                return user.score + pointsRemaining < getHighestScore();
            }

            function isAdmin(user) {
                return user.$id === scope.pool.creator
            }

            function getSuperlatives() {
                var techAndPeople = getTechAndPeople();

                scope.superlatives = [{
                    name: 'Fanboy',
                    description: 'Chose the same movie the most amount of times.',
                    winners: getFanboys(),
                    icon: 'assets/images/fanboy.png'
                }, {
                    name: 'People Person',
                    description: 'Correctly predicted the most awards given to people: Best Director, Best Actor, etc.',
                    winners: techAndPeople.peoplePeople,
                    icon: 'assets/images/people-person.png'
                }, {
                    name: 'Techie',
                    description: 'Correctly predicted the most technical awards: Film Editing, Sound Mixing, etc.',
                    winners: techAndPeople.techies,
                    icon: 'assets/images/techie.jpg'
                }, {
                    name: 'Psychic',
                    description: 'Correctly predicted awards that went against the opinion of the crowd. Arguably almost as prestigious as the overall winner. Contact Logan if you want more details.',
                    winners: getDarkHorses(),
                    icon: 'assets/images/psychic.png'
                }];

                scope.endingModal = $modal({
                    // title: 'Superlatives!',  This is a bug
                    contentTemplate: 'app/pool/_endingModal.html',
                    show: true,
                    scope: scope,
                    animation: 'am-fade-and-scale'
                });
            }

            function getTechAndPeople() {
                var counts = _.chain(scope.competitors)
                    .reject(noUserPicks)
                    .map(function(competitor) {
                        var peopleCount = _.reduce(competitor.picks, function(result, nomI, awardI) {
                            if (Number(awardI) && awards[awardI].nominees[nomI].nominee !== '' && awards[awardI].winner == nomI) {
                                result += 1;
                            }
                            return result;
                        }, 0)

                        var techCount = _.reduce(competitor.picks, function(result, nomI, awardI) {
                            if (Number(awardI) && awards[awardI].type === 'technical' && awards[awardI].winner == nomI) {
                                result += 1;
                            }
                            return result;
                        }, 0)

                        return {
                            competitor: competitor,
                            peopleCount: peopleCount,
                            techCount: techCount
                        }
                    })
                    .value();

                var topTechie = _.maxBy(counts, 'techCount').techCount
                var techies = _.filter(counts, { techCount: topTechie });
                var topPeople = _.maxBy(counts, 'peopleCount').peopleCount
                var peoplePeople = _.filter(counts, { peopleCount: topPeople });

                return {
                    techies: techies,
                    peoplePeople: peoplePeople
                }
            }

            function noUserPicks(competitor) {
                return competitor.picks.$value === null;
            }

            function getFanboys() {
                var winningCounts = _.chain(scope.competitors)
                    .reject(noUserPicks)
                    .map(function(competitor) {
                        var counts = _.chain(competitor.picks)
                            .map(function(nomI, awardI) {
                                return {
                                    nomI: nomI,
                                    awardI: awardI
                                }
                            })
                            .countBy(function(pick) {
                                if (pick.nomI === undefined || !Number(pick.awardI)) {
                                    return 'stupid'
                                }
                                return awards[pick.awardI].nominees[pick.nomI].film
                            })
                            .value();

                        counts = _.omit(counts, 'stupid');
                        var max = _.max(_.values(counts))
                        var movie = _.findKey(counts, function(count) {
                            return count === max
                        })

                        return {
                            competitor: competitor,
                            movie: movie,
                            count: max
                        }
                    })
                    .value();

                var top = _.maxBy(winningCounts, 'count').count

                return _.filter(winningCounts, { count: top })
            }

            function getDarkHorses() {
                var competitorPoints = {}

                angular.forEach(awards, function(award, aI) {
                    var correctCompetitors = _.chain(scope.competitors)
                        .reject(noUserPicks)
                        .filter(function(competitor) {
                            return competitor.picks[aI] !== undefined && competitor.picks[aI] == award.winner
                        })
                        .value();

                    angular.forEach(correctCompetitors, function(competitor) {
                        if (competitorPoints[competitor.$id] === undefined) {
                            competitorPoints[competitor.$id] = {
                                competitor: competitor,
                                count: 0
                            };
                        }

                        competitorPoints[competitor.$id].count += (1 / correctCompetitors.length)
                    })
                })

                var top = _.maxBy(_.values(competitorPoints), 'count').count;
                return _.filter(competitorPoints, {
                    count: top
                })
            }
        }
    }

})();
