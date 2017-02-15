(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PoolService', PoolService);

    /** @ngInject */
    function PoolService() {

        return {
            create: create,
            addUser: addUser,
            remove: remove,
            removeUser: removeUser
        };

        function create(pool) {
            var now = firebase.database.ServerValue.TIMESTAMP;
            var updateData = {};
            var newPoolKey = firebase.database().ref('pools').push().key;

            pool.dateCreated = now;

            updateData['pools/' + newPoolKey] = pool;
            updateData['pool-users/' + newPoolKey + '/' + pool.creator] = now;
            updateData['user-pools/' + pool.creator + '/' + newPoolKey] = now;

            return firebase.database().ref().update(updateData)
                .then(function() {
                    return newPoolKey;
                });

        }

        function addUser(uid, poolId) {
            var updateData = {};
            var now = firebase.database.ServerValue.TIMESTAMP;

            updateData['pool-users/' + poolId + '/' + uid] = now;
            updateData['user-pools/' + uid + '/' + poolId] = now;

            return firebase.database().ref().update(updateData)
        }

        function remove(competitorIds, poolId) {
            var updateData = {};

            angular.forEach(competitorIds, function(competitor) {
                updateData['user-pools/' + competitor.$id + '/' + poolId] = null;
            })

            updateData['pool-users/' + poolId] = null;
            updateData['pools/' + poolId] = null;

            return firebase.database().ref().update(updateData);
        }

        function removeUser(uid, poolId) {
            var updateData = {};

            updateData['pool-users/' + poolId + '/' + uid] = null;
            updateData['user-pools/' + uid + '/' + poolId] = null;

            return firebase.database().ref().update(updateData)
        }

    }
})();
