(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(FBUrl, toastr, currentAuth, User) {
        var vm = this;
        var ref = new Firebase(FBUrl);

        activate();

        function activate() {
            vm.user = User(currentAuth.uid);

            vm.user.$loaded()
                .then(function() {

                })
        }
    }
})();
