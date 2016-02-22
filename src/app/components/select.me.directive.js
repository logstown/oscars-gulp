(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('selectMe', selectMe);

    function selectMe($timeout) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element) {
            $timeout(function() {
                element[0].focus()
                element[0].select();
            }, 1000);
        }
    }

})();
