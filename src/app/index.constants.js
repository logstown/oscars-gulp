/* global malarkey:false, moment:false */
(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .constant('malarkey', malarkey)
        .constant('moment', moment)
        .constant('FBUrl', 'https://oscars.firebaseio.com/')
        .constant('baseUrl', 'https://oscars.firebaseapp.com/');
})();
