(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('poolPoints', poolPoints);

    /** @ngInject */
    function poolPoints(User, $firebaseObject, AwardsService, Auth, toastr, $modal) {
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
            var ref = firebase.database().ref();
            var totalPossiblePoints;
            var highestScore;
            var awards = [];

            scope.possiblePoints = 0;
            scope.users = [];

            scope.getProgressWidth = getProgressWidth;
            scope.getProgressBarColor = getProgressBarColor;
            scope.getBadgeLeft = getBadgeLeft;
            scope.itsOver = itsOver;
            scope.isWinner = isWinner;
            scope.getSuperlatives = getSuperlatives;

            activate();

            function activate() {

                scope.pool.$loaded()
                    .then(function() {
                        scope.users = getUsers(scope.pool.competitors);
                    });

                awards = AwardsService.getAwards();
                awards.$loaded()
                    .then(function() {
                        totalPossiblePoints = _.sumBy(awards, 'points');
                    })

                AwardsService.onChange(updateUserScores);
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

                            highestScore = _.maxBy(scope.users, 'score').score;
                            scope.winners = _.filter(scope.users, { score: highestScore });

                            scope.superlativesClickable = true;
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
                if (!user || !user.score) {
                    return;
                }

                var latestAward = AwardsService.getLatestAward();

                if (Number(user.picks[latestAward.$id]) === Number(latestAward.winner)) {
                    return 'progress-bar-success';
                } else {
                    return 'progress-bar-danger'
                }
            }

            function itsOver() {
                return scope.possiblePoints === totalPossiblePoints;
            }

            function isWinner(score) {
                return itsOver() && score === highestScore;
            }

            function getSuperlatives() {
                var techAndPeople = getTechAndPeople();

                scope.superlatives = [{
                    name: 'Fanboy',
                    description: 'Chose the same movie the most amount of times.',
                    winners: getFanboys(),
                    icon: 'images/fanboy.png'
                }, {
                    name: 'People Person',
                    description: 'Correctly predicted the most awards given to people: Best Director, Best Actor, etc.',
                    winners: techAndPeople.peoplePeople,
                    icon: 'images/people-person.png'
                }, {
                    name: 'Techie',
                    description: 'Correctly predicted the most technical awards: Film Editing, Sound Mixing, etc.',
                    winners: techAndPeople.techies,
                    icon: 'images/techie.jpg'
                }, {
                    name: 'Psychic',
                    description: 'Correctly predicted awards that went against the opinion of the crowd. Arguably almost as prestigious as the overall winner. Contact Logan if you want more details.',
                    winners: getDarkHorses(),
                    icon: 'images/psychic.png'
                }]

                console.log(scope.superlatives)

                scope.endingModal = $modal({
                    title: 'Superlatives!',
                    contentTemplate: 'app/pool/_endingModal.html',
                    show: true,
                    scope: scope,
                    animation: 'am-fade-and-scale'
                });
            }

            function getTechAndPeople() {
                console.log(scope.users)
                var counts = _.map(_.filter(scope.users, function(user) {
                    return user.picks.$value;
                }), function(user) {

                    console.log(user)

                    var peopleCount = _.reduce(user.picks, function(result, nomI, awardI) {
                        console.log(awardI)
                        if (nomI !== undefined && awards[awardI].nominees[nomI].nominee !== '' && awards[awardI].winner === nomI) {
                            result += 1;
                        }
                        return result;
                    }, 0)

                    var techCount = _.reduce(user.picks, function(result, nomI, awardI) {
                        if (nomI !== undefined && awards[awardI].type === 'technical' && awards[awardI].winner === nomI) {
                            result += 1;
                        }
                        return result;
                    }, 0)

                    return {
                        user: user,
                        peopleCount: peopleCount,
                        techCount: techCount
                    }
                })

                var topTechie = _.maxBy(counts, 'techCount').techCount
                var techies = _.filter(counts, {
                    techCount: topTechie
                });
                var topPeople = _.maxBy(counts, 'peopleCount').peopleCount
                var peoplePeople = _.filter(counts, {
                    peopleCount: topPeople
                });

                return {
                    techies: techies,
                    peoplePeople: peoplePeople
                }
            }

            function getFanboys() {
                var winningCounts = _.map(_.filter(scope.users, function(user) {
                    return user.picks.$value;
                }), function(user) {
                    var counts = _.countBy(user.picks, function(nomI, awardI) {
                        if (nomI === undefined) {
                            return 'stupid'
                        }
                        return awards[awardI].nominees[nomI].film
                    })

                    counts = _.omit(counts, 'stupid');
                    var max = _.max(_.values(counts))
                    var movie = _.findKey(counts, function(count) {
                        return count === max
                    })

                    return {
                        user: user,
                        movie: movie,
                        count: max
                    }
                })

                var top = _.maxBy(winningCounts, 'count').count
                return _.filter(winningCounts, {
                    count: top
                })
            }

            function getDarkHorses() {
                var userPoints = {}

                angular.forEach(awards, function(award, aI) {

                    var correctUsers = _.filter(scope.users, function(user) {
                        return user.picks && user.picks[aI] !== undefined && user.picks[aI] === award.winner
                    })

                    angular.forEach(correctUsers, function(user) {
                        if (userPoints[user.id] === undefined) {
                            userPoints[user.id] = {
                                user: user,
                                count: 0
                            };
                        }

                        userPoints[user.id].count += (1 / correctUsers.length)
                    })
                })

                console.log(userPoints)

                var top = _.maxBy(userPoints, 'count').count;
                return _.filter(userPoints, {
                    count: top
                })
            }
        }
    }

})();
