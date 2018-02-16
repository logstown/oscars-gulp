(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .factory('TimeService', TimeService);

    /** @ngInject */
    function TimeService($interval) {
        var currentTime = new Date();
        var oscarStart = new Date(2018, 2, 5, 1, - currentTime.getTimezoneOffset());
        console.log(oscarStart.getTime())
        var stopTime = $interval(updateTime, 1000);

        return {
            getCurrentTime: getCurrentTime,
            getOscarStart: getOscarStart,
            isAfterOscarStart: isAfterOscarStart
        };


        function updateTime() {
            currentTime = new Date();
        }

        function getCurrentTime() {
            return currentTime;
        }

        function getOscarStart() {
            return oscarStart;
        }

        function isAfterOscarStart() {
            return currentTime > oscarStart;
        }
    }
})();
