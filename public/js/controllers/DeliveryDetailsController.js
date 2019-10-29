'use strict';
angular.module('confusionApp')

.controller('DeliveryController', ['$rootScope', '$stateParams','$timeout','$window','$scope', 
		function ($rootScope, $stateParams,$timeout, $window, $scope) {
        $rootScope.profileActive = 'deliveryDetails'
}])