'use strict';
angular.module('confusionApp')

.controller('MessagesController', ['$rootScope', '$stateParams','$timeout','$window','$scope', 
		function ($rootScope, $stateParams,$timeout, $window, $scope) {
        $rootScope.profileActive = 'messages'
}])