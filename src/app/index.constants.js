/* global malarkey:false, moment:false */
(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .constant('malarkey', malarkey)
        .constant('moment', moment)
        .constant('baseUrl', 'https://oscars.firebaseapp.com/');
})();
