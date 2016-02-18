(function() {
    'use strict';

    const POOL_URL = 'http://oscars.firebaseapp.com/pool/';

    angular
        .module('oscarsNew')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController(TimeService, Auth, $firebaseObject, FBUrl, User, $modal, PoolService) {
        var vm = this;
        var ref = new Firebase(FBUrl);

        vm.pool = undefined;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.oscarStart = TimeService.getOscarStart();
        vm.createNewPool = createNewPool;


        activate();

        function activate() {
            var user = User(Auth.$getAuth().uid);

            user.$loaded()
                .then(function() {
                    console.log(user)
                    if (user.poolId) {
                        vm.pool = $firebaseObject(ref.child('pools').child(user.poolId));
                        vm.pool.$loaded()
                            .then(function() {

                            })
                    }
                })
        }

        function createNewPool() {
            $modal({
                templateUrl: 'app/pool/_addPool.html',
                show: true,
                controllerAs: 'vm',
                animation: 'am-fade-and-scale',
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
