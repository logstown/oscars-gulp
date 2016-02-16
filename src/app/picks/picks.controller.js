(function() {
    'use strict';

    const ADMIN_GOOGLE_UID = 'google:106090281405764589476';
    const ADMIN_FACEBOOK_UID = 'facebook:10101440252179991';
    const SCROLL_DURATION = 1000;

    angular
        .module('oscarsNew')
        .controller('PicksController', PicksController);

    /** @ngInject */
    function PicksController(FBUrl, $firebaseArray, $firebaseObject, Auth, TimeService, $document) {
        var vm = this;
        var currentUserId = Auth.$getAuth().uid;
        console.log(Auth.$getAuth())

        vm.nomineeClicked = nomineeClicked;
        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.validateAward = validateAward;
        vm.validateNominee = validateNominee;

        activate();

        function activate() {
            var ref = new Firebase(FBUrl);

            vm.awards = $firebaseArray(ref.child('awards'));
            vm.picks = $firebaseObject(ref.child('picks').child(currentUserId));

            if (TimeService.isAfterOscarStart()) {

            }
        }

        function nomineeClicked(awardIdx, nomineeIdx) {
            vm.picks.$save();

            if (!isAuthorized()) {
                return;
            }

            var award = vm.awards[awardIdx];
            award.winner = nomineeIdx;
            vm.awards.$save(award);

            scrollToNext(awardIdx);
        }

        function isAuthorized() {
            return currentUserId === ADMIN_FACEBOOK_UID || currentUserId === ADMIN_GOOGLE_UID;
        }

        function validateAward(awardIdx) {
            if (awardCantBeValidated()) {
                return;
            }

            return Number(vm.picks[awardIdx]) === vm.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function validateNominee(awardIdx, nomineeIdx) {
            if (awardCantBeValidated() || Number(vm.picks[awardIdx]) !== nomineeIdx) {
                return;
            }

            return nomineeIdx === vm.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function awardCantBeValidated(awardIdx) {
            return !vm.picks[awardIdx] || !vm.awards[awardIdx].winner || !vm.isAfterOscarStart();
        }

        function scrollToNext(awardIdxClicked) {
            var nextAwards = _.omitBy(vm.picks, function(nomineeIdx, awardIdx) {
                return awardIdx <= awardIdxClicked;
            })

            var lastIdx = awardIdxClicked;
            _.forEach(nextAwards, function(nomineeIdx, awardIdx) {
                awardIdx = Number(awardIdx)

                if (isNaN(awardIdx) || awardIdx - lastIdx > 1) {
                    return false;
                }

                lastIdx = awardIdx;
            });

            if (lastIdx === vm.awards.length - 1) {
                return;
            }

            var nextAward = angular.element(document.getElementById('award-' + (lastIdx + 1)));
            $document.scrollToElementAnimated(nextAward, 0, SCROLL_DURATION);
        }
    }
})();
