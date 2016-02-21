(function() {
    'use strict';

    const POOL_URL = 'http://oscars.firebaseapp.com/pool/';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(TimeService, Auth, $firebaseObject, FBUrl, User, $modal, $scope, PicksService) {
        var vm = this;
        var ref = new Firebase(FBUrl);
        var currentUid = Auth.$getAuth().uid;

        vm.pool = undefined;
        vm.noPool = false;
        vm.picksSize = 0;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.oscarStart = TimeService.getOscarStart();
        vm.createNewPool = createNewPool;
        vm.getProgressWidth = getProgressWidth;
        vm.getProgressBarColor = getProgressBarColor;
        vm.showRemove = showRemove;
        vm.removeUser = removeUser;

        activate();

        $scope.$on('add.pool.hide', function() {
            loadUserAndPool();
        })

        function activate() {
            loadUserAndPool();
            getPicksSize();
        }

        function loadUserAndPool() {
            var user = User(currentUid);

            user.$loaded()
                .then(function() {
                    if (user.poolId) {
                        vm.users = [];
                        vm.pool = $firebaseObject(ref.child('pools').child(user.poolId));

                        vm.pool.$loaded()
                            .then(function() {
                                if (vm.pool.$value === null) {
                                    ref.child('users').child(currentUid).child('poolId').remove();
                                    vm.pool.$destroy();

                                    return;
                                }

                                var usersRef = ref.child('users');
                                var competitorsRef = ref.child('pools').child(user.poolId).child('competitors');
                                vm.poolUrl = POOL_URL + user.poolId;

                                competitorsRef.on('child_added', function(snap) {
                                    usersRef.child(snap.key()).once('value', function(user) {
                                        vm.users.push(user.val())
                                    });
                                });
                            });
                    } else {
                        vm.noPool = true;
                    }
                });
        }

        function getPicksSize() {
            var picks = $firebaseObject(ref.child('picks').child(currentUid));

            picks.$loaded()
                .then(function() {
                    vm.picksSize = PicksService.getSize(picks);
                })
        }

        function getProgressWidth() {
            var width = vm.picksSize ? (vm.picksSize / 23) * 100 : '';

            return width + '%';
        }

        function getProgressBarColor() {
            if (!vm.picksSize) {
                return;
            }

            if (vm.picksSize < 12) {
                return 'progress-bar-danger';
            } else if (vm.picksSize < 23) {
                return 'progress-bar-warning';
            } else {
                return 'progress-bar-success';
            }
        }

        function showRemove(uid) {
            return currentUid === vm.pool.creator && uid !== vm.pool.creator;
        }

        function removeUser(user) {
            if (confirm('Confirm removing user from Pool')) {
                ref.child('pools').child(vm.pool.$id).child('competitors').child(user.uid).remove();

                _.remove(vm.users, user);
            }
        }

        function createNewPool() {
            $modal({
                templateUrl: 'app/pool/_addPool.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
                prefixEvent: 'add.pool',
                controller: function(Auth, PoolService) {
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
                }
            });
        }
    }
})();
