(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('oscarPool', oscarPool);

    /** @ngInject */
    function oscarPool(Auth, FBUrl, $modal, baseUrl) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/pool/_pool.html',
            scope: {
                pool: '='
            },
            link: link
        };

        return directive;

        function link(scope) {
            scope.currentUid = Auth.$getAuth().uid;
            var ref = new Firebase(FBUrl);

            scope.leavePool = leavePool;
            scope.removeUser = removeUser;
            scope.getProgressWidth = getProgressWidth;
            scope.getProgressBarColor = getProgressBarColor;
            scope.getInviteColspan = getInviteColspan;
            scope.inviteOthers = inviteOthers;

            function leavePool(pool) {
                var message = 'Are you sure you want to leave ' + pool.name + '?';
                var poolRef = ref.child('pools').child(pool.id);

                if (scope.currentUid === pool.creator) {
                    message += ' Note: Since you are the Admin, you will be deleting the entire pool as well.'
                }
                if (confirm(message)) {
                    poolRef.child('competitors').child(scope.currentUid).remove();
                    ref.child('users').child(scope.currentUid).child('pools').child(pool.id).remove();

                    if (scope.currentUid === pool.creator) {
                        poolRef.remove();
                    }
                }
            }

            function removeUser(pool, user) {
                if (confirm('Confirm removing user from Pool')) {
                    ref.child('pools').child(pool.id).child('competitors').child(user.uid).remove();
                }
            }

            function getProgressWidth(picksSize) {
                var width = picksSize ? (picksSize / 23) * 100 : '';

                return width + '%';
            }

            function getProgressBarColor(picksSize) {
                if (!picksSize) {
                    return;
                }

                if (picksSize < 12) {
                    return 'progress-bar-danger';
                } else if (picksSize < 23) {
                    return 'progress-bar-warning';
                } else {
                    return 'progress-bar-success';
                }
            }

            function getInviteColspan(pool) {
                return scope.currentUid === pool.creator ? 4 : 3;
            }

            function inviteOthers(pool) {
                $modal({
                    animation: 'am-fade-and-scale',
                    container: 'body',
                    templateUrl: 'app/pool/_inviteOthersModal.html',
                    locals: {
                        poolUrl: baseUrl + 'pool/' + pool.id
                    },
                    controllerAs: 'vm',
                    show: true,
                    controller: ['poolUrl', function(poolUrl) {
                        var share = this;

                        share.poolUrl = poolUrl;
                    }]
                });
            }
        }
    }
})();
