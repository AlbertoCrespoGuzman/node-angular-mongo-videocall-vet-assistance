'use strict';
angular.module('confusionApp')

.controller('SidebarController', ['UserPaymentAndDetailsFactory','AuthFactory','$rootScope', '$stateParams','$timeout','$window','$scope', '$state', 
		function (UserPaymentAndDetailsFactory, AuthFactory, $rootScope, $stateParams,$timeout, $window, $scope, $state) {
        $scope.profileActive = $state.current.url.split("/")[1]
        
		
        $scope.userType = AuthFactory.getUser_type()
        UserPaymentAndDetailsFactory.query({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                        $rootScope.user = response
                        console.log('user', response)
                        $scope.username = $rootScope.user.details ? $rootScope.user.details.firstname + ' ' +
							$rootScope.user.details.lastname : AuthFactory.getUsername()
                        
                    },
                    function (err) {
                        console.log(err);
                    }
                ) 

}])