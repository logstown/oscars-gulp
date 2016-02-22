(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PoolService', PoolService);

    /** @ngInject */
    function PoolService(FBUrl, $firebaseArray, User) {
        var poolsRef = new Firebase(FBUrl).child('pools');

        return {
            create: create
        };

        function create(pool) {
            pool.competitors = {}
            pool.competitors[pool.creator] = true;

            var pools = $firebaseArray(poolsRef);

            return pools.$add(pool)
                .then(function(newPoolRef) {
                    var user = User(pool.creator);
                    return user.$loaded()
                        .then(function() {
                            user.poolId = newPoolRef.key();

                            return user.$save()
                                .then(function() {
                                    return user.poolId;
                                });
                        })
                });

        }

    }
})();