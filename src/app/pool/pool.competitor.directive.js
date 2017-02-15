(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('poolCompetitor', poolCompetitor);

    /** @ngInject */
    function poolCompetitor($firebaseObject, PoolService, PicksArray, Auth) {
        var directive = {
            restrict: 'A',
            templateUrl: 'app/pool/_poolCompetitor.html',
            replace: true,
            scope: {
                competitorId: '=',
                pool: '='
            },
            link: link
        };

        return directive;

        function link(scope) {
            var ref = firebase.database().ref();
            scope.currentUid = Auth.$getAuth().uid;

            scope.removeUser = removeUser;
            scope.getProgressWidth = getProgressWidth;
            scope.getProgressBarColor = getProgressBarColor;

            activate();

            function activate() {
                scope.competitor = $firebaseObject(ref.child('users').child(scope.competitorId));
                scope.userPicks = PicksArray(scope.competitorId)
            }

            function removeUser() {
                if (confirm('Confirm removing user from Pool')) {
                    PoolService.removeUser(scope.competitorId, scope.pool.$id);
                }
            }

            function getProgressWidth(picksSize) {
                var width = picksSize ? (picksSize / 24) * 100 : '';

                return width + '%';
            }

            function getProgressBarColor(picksSize) {
                if (!picksSize) {
                    return;
                }

                if (picksSize < 12) {
                    return 'progress-bar-danger';
                } else if (picksSize < 24) {
                    return 'progress-bar-warning';
                } else {
                    return 'progress-bar-success';
                }
            }

        }
    }
})();
