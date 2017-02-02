(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('ProfileController', ProfileController);

    /** @ngInject */
    function ProfileController(toastr, currentAuth, User) {
        var vm = this;
        var ref = firebase.database().ref();

        activate();

        function activate() {
            vm.user = User(currentAuth.uid);

            vm.user.$loaded()
                .then(function() {

                })
        }
    }
})();
