(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PoolService', PoolService);

    /** @ngInject */
    function PoolService($firebaseArray, User) {
        var poolsRef = firebase.database().ref('pools');

        return {
            create: create
        };

        function create(pool) {
            var now = new Date().getTime();

            pool.competitors = {};
            pool.competitors[pool.creator] = now;
            pool.dateCreated = now;

            var pools = $firebaseArray(poolsRef);

            return pools.$add(pool)
                .then(function(newPoolRef) {
                    var user = User(pool.creator);

                    return user.$loaded()
                        .then(function() {
                            if (!user.pools) {
                                user.pools = {};
                            }

                            user.pools[newPoolRef.key] = new Date().getTime();

                            return user.$save()
                                .then(function() {
                                    return newPoolRef.key;
                                });
                        })
                });

        }

    }
})();
