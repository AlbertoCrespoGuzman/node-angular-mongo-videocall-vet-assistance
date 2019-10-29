'use strict';
angular.module('confusionApp')

.controller('PaymentDetailsController', ['PaypalPlanUserFactory','AuthFactory','UserPaymentTestFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
		function (PaypalPlanUserFactory, AuthFactory, UserPaymentTestFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        $rootScope.profileActive = 'paymentDetails'
        $scope.user = $rootScope.user


        
            PaypalPlanUserFactory.query({userId: AuthFactory.getIduser() })
                        .$promise.then(function(response){
                            $scope.paypalPlan = response
                        }, function(err){

                        })
        

        $scope.doSubscribeTest = function (){
            UserPaymentTestFactory.update({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                        $rootScope.user.payment = response
                        
                    },
                    function (err) {
                        console.log(err);
                    }
                ) 
            }
}])