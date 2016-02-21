(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('PicksService', PicksService);

    /** @ngInject */
    function PicksService() {

        return {
            getSize: getSize
        };

        function getSize(picks) {
            var size = _.chain(picks)
                .omitBy(function(value, key) {
                    return isNaN(Number(key));
                })
                .size()
                .value();

            return size;
        }
    }
})();
