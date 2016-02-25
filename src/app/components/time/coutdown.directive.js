(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('oscarCountdown', oscarCountdown);

    /** @ngInject */
    function oscarCountdown(TimeService) {
        var directive = {
            restrict: 'E',
            templateUrl: 'app/components/time/countdown.html',
            link: link
        };

        return directive;

        /** @ngInject */
        function link(scope) {
            scope.dismissCountdown = false;
            scope.oscarStart = TimeService.getOscarStart();

            scope.dismiss = dismiss;

            function dismiss() {
                scope.dismissCountdown = true;
            }
        }
    }

})();
