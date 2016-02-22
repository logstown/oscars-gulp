(function() {
    'use strict';

    const POOL_URL = 'http://oscars.firebaseapp.com/pool/';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(TimeService, Auth, $firebaseObject, FBUrl, User, $modal, $scope, PicksService, $sce) {
        var vm = this;
        var ref = new Firebase(FBUrl);

        vm.currentUid = Auth.$getAuth().uid;
        vm.pool = undefined;
        vm.picksSize = 0;
        vm.noPool = false;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.oscarStart = TimeService.getOscarStart();
        vm.createNewPool = createNewPool;
        vm.getProgressWidth = getProgressWidth;
        vm.getProgressBarColor = getProgressBarColor;
        vm.removeUser = removeUser;
        vm.showAdmin = showAdmin;

        activate();

        $scope.$on('add.pool.hide', function() {
            vm.noPool = false;
            loadUserAndPool();
        })

        function activate() {
            loadUserAndPool();
            getPicksSize();
        }

        function loadUserAndPool() {
            var user = User(vm.currentUid);

            user.$loaded()
                .then(function() {
                    if (!user.poolId) {
                        vm.noPool = true;
                        return;
                    }

                    vm.users = [];
                    vm.pool = $firebaseObject(ref.child('pools').child(user.poolId));

                    vm.pool.$loaded()
                        .then(function() {
                            if (vm.pool.$value === null) {
                                ref.child('users').child(vm.currentUid).child('poolId').remove();
                                vm.pool.$destroy();

                                vm.noPool = true;

                                return;
                            }

                            var usersRef = ref.child('users');
                            var competitorsRef = ref.child('pools').child(user.poolId).child('competitors');
                            createPoolUrl(user);

                            competitorsRef.on('child_added', function(snap) {
                                usersRef.child(snap.key()).once('value', function(competitor) {
                                    competitor = competitor.val();

                                    ref.child('picks').child(competitor.uid).once('value', function(userPicks) {
                                        competitor.progress = PicksService.getSize(userPicks.val())
                                        vm.users.push(competitor)
                                    })
                                });
                            });
                        });
                });
        }

        function createPoolUrl(user) {
            vm.poolUrl = POOL_URL + user.poolId;
        }

        function getPicksSize() {
            var picks = $firebaseObject(ref.child('picks').child(vm.currentUid));

            picks.$loaded()
                .then(function() {
                    vm.picksSize = PicksService.getSize(picks);
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

        function showAdmin(uid) {
            return uid === vm.pool.creator;
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
                scope: $scope,
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
