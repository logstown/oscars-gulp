(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('AfterStartController', AfterStartController);

    /** @ngInject */
    function AfterStartController(TimeService) {
        var vm = this;

        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
    }
})();
