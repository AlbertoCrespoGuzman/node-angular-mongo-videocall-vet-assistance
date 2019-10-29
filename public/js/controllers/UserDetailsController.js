'use strict';
angular.module('confusionApp')

.controller('UserDetailsController', ['AuthFactory','UserDetailsFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
		function (AuthFactory, UserDetailsFactory, $rootScope, $stateParams,$timeout, $window, $scope) {

		$scope.detailsData = {
			firstname: '',
		    lastname: '',
		    birthday: {
		    	day: '',
		    	month: '',
		    	year: ''
		    },
		    phone: {
		    	code: '',
		    	phone: ''
		    },
		    city:'',
		    country: '',
		    user: AuthFactory.getIduser()
		}

		UserDetailsFactory.query({userId: AuthFactory.getIduser() })
            .$promise.then(
                function (response) {
                	console.log('response',response)
                	console.log('response.details',response.details)
                	response.details ? $scope.postUserDetails = false : $scope.postUserDetails = true
                    $scope.detailsData = response.details
                    $rootScope.userDetails = response.details
                    console.log('$scope.postUserDetails',$scope.postUserDetails)
                },
                function (err) {
                    console.log(err);
                    $window.location.reload()
                }
        )
        $scope.doUserDetails = function(e){
        	e.preventDefault()
        	if($scope.postUserDetails){
        		$scope.detailsData.user = AuthFactory.getIduser()
        		
        		UserDetailsFactory.save({userId: AuthFactory.getIduser() }, $scope.detailsData)
		            .$promise.then(
		                function (response) {
		                    $scope.detailsData = response.details
		                },
		                function (err) {
		                    console.log(err);
		                   
		                }
		        )
		    }else{
		    	UserDetailsFactory.update({userId: AuthFactory.getIduser() }, $scope.detailsData)
		            .$promise.then(
		                function (response) {
		                    $scope.detailsData = response.details
		                },
		                function (err) {
		                    console.log(err);
		                   
		                }
		        )
		    }
	    }

        $scope.years = []
        for(var i=2001; i> 1900; i--){
        	$scope.years.push(i)
        }
        $scope.months = []
        for(var i=1; i< 13; i++){
        	$scope.months.push(i)
        }
        $scope.days = []
        for(var i=1; i< 13; i++){
        	$scope.days.push(i)
        }
}])