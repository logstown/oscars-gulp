(function() {
    'use strict';

    angular
        .module('oscarsNew')
        .controller('PicksController', PicksController);

    /** @ngInject */
    function PicksController($firebaseArray, $firebaseObject, currentAuth, TimeService, $document, $modal, User, PicksService, $state) {
        var ADMIN_GOOGLE_UID = 'google:106090281405764589476';
        var ADMIN_FACEBOOK_UID = 'facebook:10101440252179991';
        var ADMIN_TWITTER_UID = 'twitter:21528048';
        var SCROLL_DURATION = 1000;

        var vm = this;
        var currentUserId = currentAuth.uid;
        var informedUser = false;
        var ref = firebase.database().ref();

        vm.nomineeClicked = nomineeClicked;
        vm.isAfterOscarStart = TimeService.isAfterOscarStart;
        vm.validateAward = validateAward;
        vm.validateNominee = validateNominee;
        vm.pickWinner = pickWinner;
        vm.isAuthorized = isAuthorized;

        activate();

        function activate() {
            if (!currentUserId) {
                $state.go('login');
            }

            vm.awards = $firebaseArray(ref.child('awards'));
            vm.picks = $firebaseObject(ref.child('picks').child(currentUserId));

            // if (TimeService.isAfterOscarStart()) {
            //     afterStart();
            // }
        }

        // function afterStart() {
        //     var competition
        //     var user = User(currentUserId);

        //     user.$loaded()
        //         .then(function() {
        //             competition = $firebaseObject(ref.child('competitions').child(user.compId));
        //             competition.$loaded()
        //                 .then(function() {

        //                 })
        //         })
        // }

        function nomineeClicked(awardIdx) {
            vm.picks.$save();

            if (PicksService.getSize(vm.picks) === vm.awards.length && !informedUser) {
                $modal({
                    title: 'All Done!',
                    content: 'Come back <strong>' + moment(TimeService.getOscarStart()).calendar() + '</strong> during the ceremony to watch the scores update LIVE!',
                    show: true,
                    animation: 'am-fade-and-scale',
                    html: true
                });

                informedUser = true;
            } else {
                scrollToNext(awardIdx);
            }
        }

        function pickWinner(award, nomineeIdx) {
            if (isAuthorized() && TimeService.isAfterOscarStart()) {
                vm.awards[award.$id].winner = nomineeIdx;
                vm.awards[award.$id].winnerStamp = firebase.database.ServerValue.TIMESTAMP;
                vm.awards.$save(award);
            }
        }

        function isAuthorized() {
            return currentUserId === ADMIN_FACEBOOK_UID || currentUserId === ADMIN_GOOGLE_UID || currentUserId === ADMIN_TWITTER_UID;
        }

        function validateAward(awardIdx) {
            if (awardCantBeValidated(awardIdx)) {
                return;
            }

            return Number(vm.picks[awardIdx]) === vm.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function validateNominee(awardIdx, nomineeIdx) {
            if (awardCantBeValidated(awardIdx) || Number(vm.picks[awardIdx]) !== nomineeIdx) {
                return;
            }

            return nomineeIdx === vm.awards[awardIdx].winner ? 'correct' : 'incorrect';
        }

        function awardCantBeValidated(awardIdx) {
            return !vm.picks[awardIdx] || vm.awards[awardIdx].winner === undefined || !vm.isAfterOscarStart();
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
