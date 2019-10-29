'use strict';
angular.module('confusionApp')

.controller('HistoryAttendanceController', ['AuthFactory','UserVideoCallsFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
		function (AuthFactory, UserVideoCallsFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        $rootScope.profileActive = 'historyAttendance'
        $scope.currentVideocall = {}

        UserVideoCallsFactory.query({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                        $scope.videocalls = response
                        console.log(response)
                        
                    },
                    function (err) {
                        console.log(err);
                    }
                ) 
            

            $scope.showVideocallInfo = function(videocallId){
            	for(var i=0; i< $scope.videocalls.length; i++){
            		if($scope.videocalls[i]._id === videocallId){
            			$scope.currentVideocall = $scope.videocalls[i]
            			break
            		}
            	}
            	updateDuration()
            }
            function updateDuration(){
            	console.log('currentVideocall', $scope.currentVideocall)
            	var duration = (new Date($scope.currentVideocall.finishedAt).getTime() - new Date($scope.currentVideocall.startedAt).getTime()) / (1000 * 60)
            	$scope.currentVideocall.duration = Math.floor(duration) + ' mins'
            }

}])