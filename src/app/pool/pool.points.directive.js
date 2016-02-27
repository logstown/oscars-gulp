(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('poolPoints', poolPoints);

    /** @ngInject */
    function poolPoints(FBUrl, User, $firebaseObject, AwardsService) {
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

            activate();

            function activate() {
                scope.pool.$loaded()
                    .then(function() {
                        scope.users = getUsers(scope.pool.competitors);
                        AwardsService.onChange(function(award) {
                            angular.forEach(scope.users, function(user) {
                                user.$loaded()
                                    .then(function() {
                                        user.picks.$loaded()
                                            .then(function() {
                                                if (Number(user.picks[award.$id]) === Number(award.winner)) {
                                                    if (user.uid === "facebook:883444438344103") {
                                                        console.log(award.$id)
                                                    }
                                                    user.score += award.points;
                                                }
                                            })
                                    })
                            })
                        })
                    });



            }

            function getUsers(competitors) {
                return _.map(competitors, function(dateJoined, uid) {
                    var user = User(uid);

                    // ref.child('users').child(uid).once('value', function(userSnap) {

                    // })

                    user.$loaded()
                        .then(function() {
                            user.picks = $firebaseObject(ref.child('picks').child(uid))
                            user.score = 0;
                        })

                    return user;
                })
            }
        }
    }

})();
