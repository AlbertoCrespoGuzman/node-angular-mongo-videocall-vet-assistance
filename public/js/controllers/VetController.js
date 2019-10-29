'use strict';

angular.module('confusionApp')

.controller('VetController', ['VideoCallVetFactory','$state','VideoCallOverviewFactory','ngDialog','VideoCallFinishFactory','VideoCallVetStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function (VideoCallVetFactory, $state,VideoCallOverviewFactory, ngDialog, VideoCallFinishFactory, VideoCallVetStartFactory, $filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
    
    $scope.state = {
        dashboard: true,
        waitingRoom: {
            out: true,
            connecting : false,
            joinned: false,
            position: -1,
            messages: {
                first: true,
                yourTurn: false
            }
        },
        pendingVideocall: false,
        videoCall:{
            roomName: '',
            started: false,
            mute: false,
            peerConnectionProblem: false,
            dialogOpenned: false,
            fullscreen: false,
            peerAbandoned: false
        },
        screen:{
            height: $window.innerHeight
        }
    }
     $scope.username = $rootScope.username

     $scope.updateState = function(state){
        console.log('updateState', state)
        if(state === "dashboard"){
            $scope.stopRinging()
            $scope.state.dashboard = true
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = true
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
        }else if(state === "waitingRoom.in"){
            $scope.stopRinging()
            $scope.state.dashboard = false
            $scope.state.waitingRoom.in = true
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = false
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
        }else if(state === "waitingRoom.connecting"){
            $scope.state.dashboard = false
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = true
            $scope.state.waitingRoom.out = false
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
        }else if(state === "waitingRoom.out"){
            $scope.state.dashboard = true
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = true
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
        }else if(state === "videoCall.started"){
            $scope.state.dashboard = false
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = true
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = true
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
        }else if(state === "pendingCall"){
            console.log('changing to pendingCall')
            $scope.state.pendingVideocall = true
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = false
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = true
        }else if(state === "videoCall.peerAbandoned"){
            $scope.state.dashboard = false
            $scope.state.waitingRoom.in = false
            $scope.state.waitingRoom.connecting = false
            $scope.state.waitingRoom.out = true
            $scope.state.pendingVideocall = false
            $scope.state.videoCall.started = false
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.peerAbandoned = true
        }
    }

    var promise, promiseVideocall, promiseForceVideo
    
    $scope.infoText = []
    var lastClients = []
    
  //  $rootScope.videoCall = {}
   // $scope.CallButton = $filter('translate')('CALL_NEXT_CLIENT_BUTTON')
 //    $scope.hasStream = false;
 
  //  $scope.isBroadcasting = '';
    $scope.muteTextButton = 'silenciar'
    $scope.HangupTextButton = 'Colgar'
    $scope.fullscreenTextButton = 'Pantalla COmpleta'
    $scope.videocallData = {
        overview: ''
    }
    
    $scope.forceVideoCall = function(){
            $scope.updateState("dashboard")
            console.log('forcingVideoCall!!!')
            $scope.$broadcast('leaveRoom');
            $timeout( function(){
                $scope.joinRoom()
                $scope.updateState("videoCall.started")
            }, 1000 );
            
        }   
    $rootScope.$on('peerConnectionAddedVideo', function(){
        console.log('peerConnectionAddedVideo canceling timeout')
        $interval.cancel(promiseForceVideo)
    })    

    
    $scope.joinToWaitingRoom = function() {
  //    $scope.outOfWaitingRoom()
      $scope.updateState("waitingRoom.connecting")
      promise = $interval($scope.getWaitingRoom, 2000)
    }
    $scope.outOfWaitingRoom = function(notOut) {
          $interval.cancel(promise)
          $scope.updateState("waitingRoom.out")
          $rootScope.waitingRoom = {}
          if(!notOut){
              WaitingRoomFactory.update({userId: AuthFactory.getIduser() })
                    .$promise.then(
                        function (response) {
                            console.log('waitingRoom after out', response)
                        },
                        function (err) {
                            console.log(err);
                        }
                    )
            }
        }

    $scope.$on('$destroy', function() {
      $scope.outOfWaitingRoom()
      $scope.outOfVideoCall()
    })

    $scope.playRinging = function() {

        if(!$scope.state.videoCall.nowRinging){
            $scope.state.videoCall.nowRinging = true

            $scope.audio = new Audio('audio/uniphone.wav');
                $scope.audio.addEventListener('ended', function() {
                    console.log('audioended')
                        this.currentTime = 0;
                        this.play();
                    }, false);                                        
            $scope.audio.play();
        }
    }
    $scope.stopRinging = function(){
        if($scope.audio){
            $scope.audio.pause()
            $scope.state.videoCall.nowRinging = false
        }
        
    }

    $scope.getWaitingRoom = function(){
        WaitingRoomFactory.query({userId: AuthFactory.getIduser() })
            .$promise.then(
                function (response) {
                    $rootScope.waitingRoom = response
                    console.log(response)
                    updateInfo($rootScope.waitingRoom)
                    
                },
                function (err) {
                    console.log(err);
                    $window.location.reload()
                }
        );
    }    

    function updateInfo(waitingRoom){
        if(lastClients.length != waitingRoom.clients.length){
            var message = {}
            if(waitingRoom.clients.length == 1){
            message = {
                    name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                    message: $filter('translate')('INFORMATION_VETS_CLIENTS_COUNT_SINGULAR'),
                    date: $filter('date')(new Date())
                }
            }else if(waitingRoom.clients.length > 1){
            message = {
                    name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                    message: $filter('translate')('INFORMATION_VETS_CLIENTS_COUNT_PART_1_PLURAL') + waitingRoom.clients.length + $filter('translate')('INFORMATION_VETS_CLIENTS_COUNT_PART_2_PLURAL'),
                    date: $filter('date')(new Date())
                }
            }
            $scope.infoText.push(message)
            lastClients = waitingRoom.clients
            
        }
        checkPendingVideoCall(waitingRoom)
    }
    function checkPendingVideoCall(waitingRoom){

        if(waitingRoom.videocalls && waitingRoom.videocalls.length > 0){
            for(var i=0; i < waitingRoom.videocalls.length; i++){
                if(waitingRoom.videocalls[i].vet._id == AuthFactory.getIduser() && waitingRoom.videocalls[i].status == 2){
                    $scope.updateState("pendingCall")
                    $rootScope.videoCall = waitingRoom.videocalls[i]
                    $scope.playRinging()
                    break
                }if(waitingRoom.videocalls[i].vet._id == AuthFactory.getIduser() && waitingRoom.videocalls[i].status == 4){
                    $scope.updateState("videoCall.peerAbandoned")
                    $scope.stopRinging()
                    $scope.leaveRoom()
                }
            }
        }else{
            $scope.updateState("waitingRoom.in")
        }
    }
    $scope.openOverviewDialog = function (){
        $scope.updateState("dashboard")
        
        if(!$scope.state.videoCall.dialogOpenned){
          $scope.state.videoCall.dialogOpenned = true  
          $rootScope.videocallOverviewDialog = ngDialog.open({ 
                                                            template: 'views/videocallOverviewDialog.html', 
                                                            scope: $scope, 
                                                            className: 'ngdialog-theme-default', 
                                                            controller:"VetController",backdrop: 
                                                            'static',keyboard: false,
                                                            closeByEscape: false,
                                                            closeByDocument: false })

        }
    }
    $scope.doOverview = function(){

        VideoCallOverviewFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id }, {overview: $scope.videocallData.overview})
            .$promise.then(
                function (response) {
                  $scope.message = $filter('translate')('OVERVIEW_SENT_SUCCESSFULLY')
                  $rootScope.dialogMessageAndButton =  ngDialog.open({ 
                                                                template: 'views/dialogMessageAndButton.html', 
                                                                scope: $scope, 
                                                                className: 'ngdialog-theme-default', 
                                                                controller:"VetController",
                                                                backdrop: 'static',
                                                                keyboard: false,
                                                                closeByEscape: false,
                                                                closeByDocument: false });
                
                },
                function (err) {
                    console.log(err);
                }
        );
    } 
    $scope.doAcceptDialogButton = function () {
        console.log('doAcceptDialogButton')
        ngDialog.close( $rootScope.dialogMessageAndButton )
        $window.location.reload()
    }   
    $scope.startCallNextClient = function () {
            VideoCallVetStartFactory.save({userId: AuthFactory.getIduser() }, {})
                .$promise.then(
                        function (response) {
                            $rootScope.videoCall = response
                            $scope.outOfWaitingRoom(true)
                            $scope.joinToVideoCall()
                            $scope.updateState("videoCall.started")
                        },
                        function (response) {
                            console.log(response);
                        }
                    )
    }
    $scope.resumeCall = function () {
      //  $scope.roomName = $scope.videoCall._id
      $scope.outOfWaitingRoom(true)
      $scope.updateState("videoCall.started")
        $scope.stopRinging()
        
        
        $scope.joinToVideoCall()
    //    $scope.videoCallStarted = true
                       
    }    

    $scope.joinRoom = function () {
          $scope.$broadcast('joinRoom');
          $scope.joinedRoom = true
        }
    $scope.leaveRoom = function () {
            VideoCallFinishFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id }, {})
                .$promise.then(
                        function (response) {
                            
                            $scope.$broadcast('leaveRoom');
                            $scope.outOfVideoCall()
                            $scope.openOverviewDialog()
                        },
                        function (response) {
                            console.log(response);
                        }
                    )
        }

    $scope.joinToVideoCall = function() {
        console.log('joinToVideoCall')
          
          promiseVideocall = $interval($scope.getVideoCall, 2000)
        }
        $scope.outOfVideoCall = function() {
        //  $scope.state.dashboard = true
          $interval.cancel(promiseVideocall)
          $scope.state.videoCall.out = true
          $scope.state.videoCall.started = false
        //  $rootScope.videoCall = {}
        }

        $scope.getVideoCall = function (){
            $scope.state.pendingVideocall = false
            VideoCallVetFactory.query({videocallId: $rootScope.videoCall._id })
                .$promise.then(
                    function (response) {
                        $rootScope.videoCall = response
                        if($rootScope.videoCall.status === 3){
                            $scope.state.videoCall.nowRinging = false
                            $scope.openOverviewDialog()
                        }else if($scope.state.videoCall.peerConnectionProblem){
                            if($rootScope.videoCall.status ==2){
                             //   $scope.state.videoCall.peerConnectionProblem = false
                            }
                        }else if($rootScope.videoCall.status == 4){
                            $scope.state.videoCall.peerAbandoned = true
                            $scope.state.videoCall.nowRinging = false
                            $scope.$broadcast('leaveRoom');
                            $scope.outOfVideoCall()
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
        }

    $rootScope.$on('peerConnectionLost', function(){
            console.log('peerConnectionLost', $rootScope.videoCall)
            var supercontainer = angular.element( document.querySelector( '#supercontainer' ) )[0]

                supercontainer.style['height'] = $scope.state.screen.height - 80 + 'px'
                supercontainer.style.background = 'black'
                $scope.state.videoCall.peerConnectionProblem = true
        })
    $rootScope.$on('peerConnectionAdded', function(){
            console.log('peerConnectionAdded')
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.nowRinging = false
            var supercontainer = angular.element( document.querySelector( '#supercontainer' ) )[0]

                supercontainer.style['background'] = ''
                supercontainer.style['height'] = ''
                supercontainer.style['max-height'] = $scope.state.screen.height + 'px'
                supercontainer.style['max-width'] = (($rootScope.videoWidth / $rootScope.videoHeight) * $scope.state.screen.height) + 'px'
                
                promiseForceVideo = $interval($scope.forceVideoCall, 5000)

        })
    $scope.toggleMute = function() {
            $scope.state.videoCall.mute = !$scope.state.videoCall.mute
            if($scope.state.videoCall.mute){
                $scope.$broadcast('audioOff')    
                $scope.muteTextButton = 'silenciar'
            }else{
                $scope.$broadcast('audioOn')
                $scope.muteTextButton = 'activar Sonido'
            }
        }
        $scope.toggleFullscreen = function() {

        console.log('$rootScope.videoWidth',$rootScope.videoWidth)
        console.log('$rootScope.videoHeight',$rootScope.videoHeight)
            $scope.state.videoCall.fullscreen = !$scope.state.videoCall.fullscreen
            var supercontainer = angular.element( document.querySelector( '#supercontainer' ) )[0]
            var body = angular.element( document.querySelector( 'body' ) )[0]
            var videoRatio = $rootScope.videoWidth / $rootScope.videoHeight
            var windowRatio = $window.innerWidth / $window.innerHeight
            var header = angular.element( document.querySelector( '#header.lazy-load' ) );
            console.log('videoRatio', videoRatio)
            console.log('windowRatio', windowRatio)

            if($scope.state.videoCall.fullscreen){
                screenfull.request()
                supercontainer.style.position = 'absolute'
                
                body.style.background = 'black'
                header.removeClass('visible')
                if(windowRatio > 1){
                    supercontainer.style.top = '0px'
                    supercontainer.style.height = $window.outerHeight + 'px'
                    var widthMusted = videoRatio * $window.outerHeight
                    supercontainer.style.width = widthMusted + 'px'
                    supercontainer.style.left =  ($window.outerWidth - supercontainer.style.width.split('px')[0]) / 2 + 'px'
                    
                 }else{
                    supercontainer.style.left = '0px'
                    supercontainer.style.width = $window.outerWidth + 'px'
                    var heighthMusted = videoRatio * $window.outerWidth
                    supercontainer.style.height = heighthMusted + 'px'
                    supercontainer.style.top =  ($window.outerHeight - supercontainer.style.height.split('px')[0]) / 2 + 'px'
                 }       
                 
               /*
                if($rootScope.videoWidth >= $rootScope.videoHeight){
                    $window.innerWidth 
                    supercontainer.style.left = '50px'
                    supercontainer.style.right = '50px'
                    supercontainer.style.bottom = '0px'
                    supercontainer.style.top = '0px'
                    supercontainer.style['margin-top'] = '-10px'
                     supercontainer.style['margin-bottom'] = '10px'
                     supercontainer.style.overflow = 'hidden'

               //     supercontainer.style.height = ( $rootScope.videoHeight / $rootScope.videoWidth ) * $window.innerHeight
                }else{
                    supercontainer.style.left = '50px'
                    supercontainer.style.right = '50px'
                    supercontainer.style.bottom = '0px'
                    supercontainer.style.top = '0px'
                    supercontainer.style['margin-top'] = '-10px'
                    supercontainer.style['margin-bottom'] = '10px'
                    supercontainer.style.overflow = 'hidden'
                }
                */
                
                supercontainer.className = ''
                screenfull.request()
                /*
                var videocallContainer = angular.element( document.querySelector( '#videocall-container' ) )[0]
                var remoteVideoContainer = angular.element( document.querySelector( '#remoteVideoContainer' ) )[0]
                var remoteVideo = angular.element( document.querySelector( '.remoteVideo' ) )[0]
                var localVideoContainer = angular.element( document.querySelector( '#localVideoContainer' ) )[0]
                var localVolume = angular.element( document.querySelector( '#localVolume' ) )[0]
                var videocallControls = angular.element( document.querySelector( '#videocall-controls' ) )[0]

                console.log(remoteVideo)
                screenfull.request()
                videocallContainer.style.height = $window.innerHeight
                videocallContainer.style.width = $window.innerWidth
                remoteVideoContainer.style.height = $window.innerHeight
                remoteVideoContainer.style.width = $window.innerWidth
                remoteVideo.style.height = $window.innerHeight
                remoteVideo.style.width = $window.innerWidth
                for(var i=0; i< remoteVideo.childNodes.length; i++){
                    if(remoteVideo.childNodes[i].id.indexOf('video_incoming') != -1){
                        console.log('dentro')
                        remoteVideo.childNodes[i].style.height = $window.innerHeight + 'px'
                        remoteVideo.childNodes[i].style.width = $window.innerWidth + 'px'
                    }
                }
                console.log('$window.innerHeight',$window.innerHeight)
                console.log('$window.innerWidth',$window.innerWidth)
                $scope.fullscreenTextButton = 'Disminuir pantalla'
                if($rootScope.videoWidth > $rootScope.videoHeight){
                    localVideoContainer.className = 'localVideoContainer-fullscreen-widther'
                   // localVolume.className = 'videocall-controls-fullscreen-widther'
                   videocallControls.className = 'videocall-controls-fullscreen-widther'
                }
                */
            }else{
                $scope.fullscreenTextButton = 'Pantalla Completa'
                screenfull.exit()
                header.addClass('visible')
                body.style.background = ''
                supercontainer.className = 'col-md-8 col-md-offset-2'
                 if($rootScope.screenWidth > $rootScope.screenHeight){
                      if($rootScope.videoWidth < $rootScope.videoHeight){
                // /        video.style.width = (video.videoWidth / video.videoHeight) * 100 + '%'
                            supercontainer.className = 'col-md-4 col-md-offset-4'
                      } 
                  }
                supercontainer.style = {}
                supercontainer.style['margin-top'] = '20px'
            }
        }
}])  