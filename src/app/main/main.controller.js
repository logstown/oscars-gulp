(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(Auth, FBUrl, User, $modal, baseUrl) {
        var vm = this;

        var ref = new Firebase(FBUrl);
        var poolsRef = ref.child('pools');
        var picksRef = ref.child('picks');
        var usersRef = ref.child('users');

        vm.currentUid = Auth.$getAuth().uid;
        vm.pools = [];
        vm.picksSize = 0;
        vm.noPool = false;

        vm.createNewPool = createNewPool;

        activate();

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
                                newPool.poolUrl = baseUrl + 'pool/' + poolId;
                            })
                    }
                }]
            });
        }
    }
})();
