(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('oscarPool', oscarPool);

    /** @ngInject */
    function oscarPool(Auth, $modal, baseUrl, $firebaseObject, $firebaseArray, PoolService) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/pool/_pool.html',
            scope: {
                poolId: '='
            },
            link: link
        };

        return directive;

        function link(scope) {
            var ref = firebase.database().ref();
            scope.currentUid = Auth.$getAuth().uid;

            scope.leavePool = leavePool;
            scope.inviteOthers = inviteOthers;

            activate()

            function activate() {
                scope.pool = $firebaseObject(ref.child('pools').child(scope.poolId));
                scope.competitors = $firebaseArray(ref.child('pool-users').child(scope.poolId));
            }

            function leavePool(pool) {
                var message = 'Are you sure you want to leave ' + pool.name + '?';
                var poolRef = ref.child('pools').child(pool.$id);

                if (scope.currentUid === pool.creator) {
                    message += ' Note: Since you are the Admin, you will be deleting the entire pool as well.'
                }
                if (confirm(message)) {
                    if (scope.currentUid === pool.creator) {
                        PoolService.remove(scope.competitors, pool.$id);
                    } else {

                        PoolService.removeUser(scope.currentUid, pool.$id);
                    }
                }
            }


            function inviteOthers(pool) {
                $modal({
                    animation: 'am-fade-and-scale',
                    container: 'body',
                    templateUrl: 'app/pool/_inviteOthersModal.html',
                    locals: {
                        poolUrl: baseUrl + 'pool/' + pool.$id
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
