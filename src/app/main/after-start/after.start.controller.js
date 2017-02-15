(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('AfterStartController', AfterStartController);

    /** @ngInject */
    function AfterStartController(Auth, UserPools, AwardsService, PicksObject, toastr) {
        var vm = this;
        var ref = firebase.database().ref();
        var currentUid = Auth.$getAuth().uid;
        var userPicks = PicksObject(currentUid);

        userPicks.$loaded()
            .then(function() {
                ref.child('awards').on('child_changed', function(awardSnap) {
                    var userPick = Number(userPicks[awardSnap.key]);
                    var winner = Number(awardSnap.val().winner);

                    if (userPick === winner) {
                        toastr.success('You got it Right!');
                    } else {
                        toastr.error('Better luck on the next one.')
                    }
                })
            })

        vm.userPools = UserPools(currentUid);

        vm.getLatestAward = AwardsService.getLatestAward;
        vm.getPossiblePoints = AwardsService.getPossiblePoints;
        vm.getTotalPoints = AwardsService.getTotalPoints;

        vm.getAlertClass = function() {
            var latest = vm.getLatestAward();

            if (Number(userPicks[latest.$id]) === Number(latest.winner)) {
                return 'alert-success';
            } else {
                return 'alert-danger'
            }
        }
    }
})();
