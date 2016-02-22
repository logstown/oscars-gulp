(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .config(config);

    /** @ngInject */
    function config($logProvider, toastrConfig, $locationProvider) {
        // Enable log
        $logProvider.debugEnabled(true);

        // Set options third-party lib
        toastrConfig.allowHtml = true;
        toastrConfig.timeOut = 3000;
        toastrConfig.positionClass = 'toast-bottom-right';
        toastrConfig.preventDuplicates = true;
        toastrConfig.progressBar = true;

        $locationProvider.html5Mode(true);
    }

})();
