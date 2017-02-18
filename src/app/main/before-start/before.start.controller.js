(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('BeforeStartController', BeforeStartController);

    /** @ngInject */
    function BeforeStartController(Auth, UserPools, $modal, baseUrl, $state, TimeService) {
        var vm = this;

        var ref = firebase.database().ref();
        var currentUid = Auth.$getAuth().uid;

        vm.userPools = [];
        vm.picksSize = 0;
        vm.oscarStart = moment(TimeService.getOscarStart()).calendar();

        vm.createNewPool = createNewPool;

        activate();

        function activate() {
            if (!currentUid) {
                $state.go('login');
            }

            vm.picksLoading = true;
            ref.child('picks')
                .child(currentUid)
                .once('value')
                .then(function(userPicksSnap) {
                    vm.picksSize = userPicksSnap.numChildren();

                    vm.picksLoading = false;
                });

            vm.poolsLoading = true;
            vm.userPools = UserPools(currentUid);

            vm.userPools.$loaded()
                .then(function() {
                    vm.poolsLoading = false;
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
                                newPool.poolUrl = baseUrl + 'pool/' + poolId;
                            })
                    }
                }]
            });
        }
    }
})();
