(function() {
    'use strict';

    const POOL_URL = 'http://oscars.firebaseapp.com/pool/';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(TimeService, Auth, $firebaseObject, FBUrl, User, $modal, PoolService, $scope) {
        var vm = this;
        var ref = new Firebase(FBUrl);
        var uid = Auth.$getAuth().uid;

        vm.pool = undefined;
        vm.noPool = false;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.oscarStart = TimeService.getOscarStart();
        vm.createNewPool = createNewPool;

        activate();

        $scope.$on('add.pool.hide', function() {
            loadUserAndPool();
        })

        function activate() {
            loadUserAndPool();
        }

        function loadUserAndPool() {
            var user = User(uid);

            user.$loaded()
                .then(function() {
                    if (user.poolId) {
                        vm.users = [];
                        vm.pool = $firebaseObject(ref.child('pools').child(user.poolId));
                        vm.poolUrl = POOL_URL + user.poolId;

                        vm.pool.$loaded()
                            .then(function() {
                                var usersRef = ref.child('users');
                                var competitorsRef = ref.child('pools').child(user.poolId).child('competitors');

                                competitorsRef.on('child_added', function(snap) {
                                    usersRef.child(snap.key()).once('value', function(deal) {
                                        vm.users.push(deal.val())
                                    })
                                })


                            })
                    } else {
                        vm.noPool = true;
                    }
                })
        }

        function createNewPool() {

            $modal({
                templateUrl: 'app/pool/_addPool.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
                prefixEvent: 'add.pool',
                controller: function() {
                    var newPool = this;

                    newPool.poolUrl = '';
                    newPool.newPoolName = '';

                    newPool.create = create;

                    function create() {
                        if (!newPool.newPoolName) {
                            return;
                        }

                        PoolService.create(newPool.newPoolName, Auth.$getAuth().uid)
                            .then(function(poolId) {
                                newPool.poolUrl = POOL_URL + poolId;
                            })
                    }
                }
            });
        }
    }
})();
