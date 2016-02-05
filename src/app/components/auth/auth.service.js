(function() {
  'use strict';

  angular
    .module('oscarsNew')
    .factory('Auth', Auth);

  /** @ngInject */
  function Auth($firebaseAuth) {
    var ref = new Firebase('https://oscars.firebaseio.com/');
    return $firebaseAuth(ref);
  }
})();
