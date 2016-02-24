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
            pool.competitors[pool.creator] = new Date().getTime();

            var pools = $firebaseArray(poolsRef);

            return pools.$add(pool)
                .then(function(newPoolRef) {
                    var user = User(pool.creator);
                    return user.$loaded()
                        .then(function() {
                            if (!user.pools) {
                                user.pools = {};
                            }
                            user.pools[newPoolRef.key()] = new Date().getTime();

                            return user.$save()
                                .then(function() {
                                    return newPoolRef.key();
                                });
                        })
                });

        }

    }
})();
