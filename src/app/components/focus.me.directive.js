(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .directive('focusMe', focusMe);

    function focusMe($timeout) {
        var directive = {
            restrict: 'A',
            link: link
        };

        return directive;

        function link(scope, element) {
            $timeout(function() {
                element[0].focus();
            });
        }
    }

})();
