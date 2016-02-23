(function() {
    'use strict';

    const POOL_URL = 'http://oscars.firebaseapp.com/pool/';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(TimeService, Auth, $firebaseObject, FBUrl, User, $modal) {
        var vm = this;
        var ref = new Firebase(FBUrl);
        var poolsRef = ref.child('pools');
        var picksRef = ref.child('picks');
        var usersRef = ref.child('users');

        vm.currentUid = Auth.$getAuth().uid;
        vm.pools = [];
        vm.picksSize = 0;
        vm.noPool = false;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.oscarStart = TimeService.getOscarStart();
        vm.createNewPool = createNewPool;
        vm.getProgressWidth = getProgressWidth;
        vm.getProgressBarColor = getProgressBarColor;
        vm.removeUser = removeUser;
        vm.inviteOthers = inviteOthers;
        vm.getInviteColspan = getInviteColspan;
        vm.leavePool = leavePool;

        activate();

        // $scope.$on('add.pool.hide', function() {
        //     vm.noPool = false;
        //     loadUserAndPool();
        // })

        function activate() {
            loadUserAndPool();
            getPicksSize();
        }

        function loadUserAndPool() {
            var user = User(vm.currentUid);

            user.$loaded()
                .then(function(user) {
                    if (!user.pools) {
                        vm.noPools = true;
                        return;
                    }

                    getPools();
                });
        }

        function getPools() {
            var userPoolsRef = usersRef.child(vm.currentUid).child('pools');

            userPoolsRef.on('child_added', function(poolIdSnap) {
                var poolId = poolIdSnap.key();
                var poolRef = poolsRef.child(poolId);

                poolRef.once('value', function(poolSnap) {
                    var pool = poolSnap.val();

                    if (pool === null) {
                        userPoolsRef.child(poolId).remove();
                        vm.noPools = true;
                    } else {
                        pool.id = poolId;
                        pool.users = [];
                        vm.pools.push(pool);

                        poolRef.child('competitors').on('child_added', function(competitorIdSnap) {
                            var competitorId = competitorIdSnap.key();

                            usersRef.child(competitorId).once('value', function(competitorSnap) {
                                var poolIdx = _.findIndex(vm.pools, { id: poolId });
                                var competitor = competitorSnap.val();

                                competitor.id = competitorId;
                                competitor.progress = 0;
                                vm.pools[poolIdx].users.push(competitor);

                                picksRef.child(competitor.uid).on('child_added', function() {
                                    var competitorIdx = _.findIndex(vm.pools[poolIdx].users, { id: competitorId });
                                    vm.pools[poolIdx].users[competitorIdx].progress++;
                                })
                            })
                        })

                        poolRef.child('competitors').on('child_removed', function(competitorIdSnap) {
                            var poolIdx = _.findIndex(vm.pools, { id: poolId });
                            _.remove(vm.pools[poolIdx].users, { id: competitorIdSnap.key() })
                        })
                    }
                })
            })

            userPoolsRef.on('child_removed', function(poolIdSnap) {
                _.remove(vm.pools, { id: poolIdSnap.key() })
            })
        }

        function getPicksSize() {
            picksRef.child(vm.currentUid).once('value', function(userPicksSnap) {
                vm.picksSize = userPicksSnap.numChildren();
            })
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

        function removeUser(user) {
            if (confirm('Confirm removing user from Pool')) {
                ref.child('pools').child(vm.pool.$id).child('competitors').child(user.uid).remove();
            }
        }

        function getInviteColspan(pool) {
            return vm.currentUid === pool.creator ? 4 : 3;
        }

        function leavePool(pool) {
            var message = 'Are you sure you want to leave ' + pool.name + '?';

            if (vm.currentUid === pool.creator) {
                message += ' Note: Since you are the Admin, you will be deleting the entire pool as well.'
            }
            if (confirm(message)) {
                ref.child('pools').child(pool.id).child('competitors').child(vm.currentUid).remove();
                ref.child('users').child(vm.currentUid).child('pools').child(pool.id).remove();

                if (vm.currentUid === pool.creator) {
                    ref.child('pools').child(pool.id).remove();
                }
            }
        }

        function inviteOthers(pool) {
            $modal({
                animation: 'am-fade-and-scale',
                container: 'body',
                templateUrl: 'pool-link.html',
                locals: {
                    poolUrl: POOL_URL + pool.id
                },
                controllerAs: 'vm',
                show: true,
                controller: ['poolUrl', function(poolUrl) {
                    var share = this;

                    share.poolUrl = poolUrl;
                }]
            });
        }

        function createNewPool() {
            $modal({
                templateUrl: 'app/pool/_addPool.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
                controller: ['Auth', 'PoolService', function(Auth, PoolService) {
                    var newPool = this;

                    newPool.poolUrl = '';
                    newPool.pool = {
                        name: '',
                        creator: Auth.$getAuth().uid
                    };

                    newPool.create = create;

                    function create() {
                        if (!newPool.pool.name) {
                            return;
                        }

                        PoolService.create(newPool.pool)
                            .then(function(poolId) {
                                newPool.poolUrl = POOL_URL + poolId;
                            })
                    }
                }]
            });
        }
    }
})();
