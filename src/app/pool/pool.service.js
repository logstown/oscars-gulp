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

        function create(name, uid) {
            var newPool = {
                name: name,
                creator: uid,
                competitors: {}
            };

            newPool.competitors[uid] = true;

            var pools = $firebaseArray(poolsRef);

            return pools.$add(newPool)
                .then(function(newPoolRef) {
                    var user = User(uid);
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
