'use strict';

angular.module('confusionApp')

.controller('ClientController', ['UserPaymentDetailsFactory','$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory','VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function (UserPaymentDetailsFactory, $state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory, VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        
        var promise, promiseVideocall, promiseForceVideo
        var lastClients = []
        var audio

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
        pendingVideocall: $rootScope.pendingVideocall,
        videoCall:{
            roomName: '',
            started: $rootScope.videoCallStarted,
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
        }else if(state === "videoCall.started"){
            console.log('videoCall.started')
            $rootScope.videoCallStarted = true
            $rootScope.pendingVideocall = false
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
        $scope.infoText = []
        lastClients = []
        
        $scope.hovering = [false, false, false, false, false] 


        
        $scope.$on('$destroy', function() {
          $scope.outOfWaitingRoom()
          $scope.outOfVideoCall()
        })

        $scope.joinToWaitingRoom = function() {
        // /  $scope.outOfWaitingRoom()
            $scope.openPetsSelectionDialog()
          
          
        }
        $scope.openPetsSelectionDialog = function (){
            $rootScope.petSelectionDialog = ngDialog.open({ 
                                                            template: 'views/selectPetDialog.html', 
                                                            scope: $scope, 
                                                            className: 'ngdialog-theme-default', 
                                                            controller:"SelectPetDialogController",
                                                            backdrop: 'static',
                                                            keyboard: false,
                                                            closeByEscape: false,
                                                            closeByDocument: false })
        }
        $rootScope.checkUserCredits = function(){
            UserPaymentDetailsFactory.query({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                        $rootScope.payment = response.payment
                        if($rootScope.payment.credits > 0){
                            $scope.updateState("waitingRoom.connecting")
                            promise = $interval($scope.getWaitingRoom, 2000)
                        }else{
                            $scope.openCreditsDialog()
                        }
                    },
                    function (err) {
                        console.log(err);
                        $window.location.reload()
                    }
                )
        }
        $scope.openCreditsDialog = function(){
            $scope.creditsDialog = ngDialog.open({ 
                                                            template: 'views/creditsDialog.html', 
                                                            scope: $scope, 
                                                            className: 'ngdialog-theme-default', 
                                                            controller:"CreditsController",
                                                            backdrop: 'static',
                                                            keyboard: false,
                                                            closeByEscape: false,
                                                            closeByDocument: false })
        }
        $rootScope.closeCreditsDialog = function(){
            $scope.creditsDialog.close()
            $state.go('app.profile.payment', {})
        }
        $scope.getWaitingRoom = function(){

            WaitingRoomFactory.query({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                        $rootScope.waitingRoom = response
                        updateInfo($rootScope.waitingRoom)
                       
                    },
                    function (err) {
                        console.log(err);
                        $window.location.reload()
                    }
                )
        }
        $scope.outOfWaitingRoom = function() {
            console.log('cancel promise')
          $interval.cancel(promise)
          $scope.updateState("waitingRoom.out")
          $rootScope.waitingRoom = {}

          WaitingRoomFactory.update({userId: AuthFactory.getIduser() })
                .$promise.then(
                    function (response) {
                    //    $rootScope.waitingRoom = response
                    //    updateInfo($rootScope.waitingRoom)
                       
                    },
                    function (err) {
                        console.log(err);
                    }
                )
        }


        function updateInfo(waitingRoom){
            
            if($scope.state.waitingRoom.messages.first){
                message = {
                    name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                    message: $filter('translate')('INFORMATION_WELLCOME_MESSAGE'),
                    date: $filter('date')(new Date())
                }
                $scope.state.waitingRoom.messages.first = false
                $scope.infoText.push(message)
            }else{ 
                if($scope.state.waitingRoom.position != getClientPosition(waitingRoom)){
                    $scope.state.waitingRoom.position = getClientPosition(waitingRoom)
                    var message = {}
                    if($scope.state.waitingRoom.position > 1){
                        message = {
                            name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                            message: $filter('translate')('INFORMATION_CLIENTS_BEFORE_MESSAGE_PLURAL_PART_1') + waitingRoom.clients.length + $filter('translate')('INFORMATION_CLIENTS_BEFORE_MESSAGE_PLURAL_PART_2'),
                            date: $filter('date')(new Date())
                        }
                    }else if($scope.state.waitingRoom.position === 1){
                        message = {
                            name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                            message: $filter('translate')('INFORMATION_CLIENTS_BEFORE_MESSAGE_SINGULAR'),
                            date: $filter('date')(new Date())
                        }
                    }else if($scope.state.waitingRoom.position === 0 && !$scope.state.waitingRoom.messages.yourTurn){
                        message = {
                            name: $filter('translate')('INFORMATION_MESSAGE_TITLE'),
                            message: $filter('translate')('INFORMATION_CLIENTS_YOUR_TURN_MESSAGE'),
                            date: $filter('date')(new Date())
                        }
                        $scope.state.waitingRoom.messages.yourTurn = true
                    }
                    $scope.infoText.push(message)
                    lastClients = waitingRoom.clients
                    
                }
            }
            if(!$scope.state.videoCall.started){
            	checkIfVetIsCalling(waitingRoom)
        	}
        }
        function getClientPosition(waitingRoom) {
            var position = -1
            for(var i=0; i <waitingRoom.clients.length; i++){
                if(waitingRoom.clients[i]._id === AuthFactory.getIduser()) position = i
            }
            return position
        }
        function checkIfVetIsCalling(waitingRoom){

            if(waitingRoom.videocalls && waitingRoom.videocalls.length > 0){
                for(var videocall in waitingRoom.videocalls){
                    
                    if(waitingRoom.videocalls[videocall].client._id === AuthFactory.getIduser()){
                        $rootScope.videoCall = waitingRoom.videocalls[videocall]
                        $scope.videoCall = waitingRoom.videocalls[videocall]
                        $scope.state.waitingRoom.connecting = false
                        setCallingNow()
                        if($rootScope.videoCall.status == 2){
                            console.log('checkIfVetIsCalling pendingVideocall')
                            $scope.state.pendingVideocall = true
                          }
                    }
                }
            }else{
                $scope.updateState("waitingRoom.in")
            }
        }
        function setCallingNow(){
            $scope.playRinging()
            $scope.state.videoCall.showRinging = true

        }
        
        $rootScope.acceptVideocall = function(){
        	$scope.updateState("videoCall.started")
            $scope.outOfWaitingRoom()
            $scope.acceptVideocallDialog.close()

             console.log('acceptVideocall before send startClient...  state', $scope.state)
            VideoCallClientStartFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id,
             petId : $rootScope.pet_selected }, {})
                .$promise.then(
                        function (response) {
                            $rootScope.videoCall = response
                            $scope.maxNumPeers = 2;
                            $rootScope.maxNumPeers = 2;
                            $scope.joinedRoom = true;
                            $scope.updateState("videoCall.started")
                            $scope.joinRoom()
                            $scope.joinToVideoCall()

                            console.log('acceptVideocall before send startClient...  state', $scope.state)

                        },
                        function (response) {
                            console.log(response);
                        }
                    );
        }
        $rootScope.cancelAcceptVideocallDialog = function(){
            $scope.acceptVideocallDialog.close()
        }

        $scope.resumeCall = function () {
      //  $scope.roomName = $scope.videoCall._id
       
        $scope.outOfWaitingRoom()
        $scope.updateState("videoCall.started")
        $scope.stopRinging()
        VideoCallClientStartFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id }, {})
                .$promise.then(
                        function (response) {
                            $rootScope.videoCall = response
                            $scope.outOfWaitingRoom()
                            $scope.maxNumPeers = 2;
                            $rootScope.maxNumPeers = 2;
                            $scope.joinedRoom = true;
                            $scope.updateState("videoCall.started")
                            $scope.joinRoom()
                            $scope.joinToVideoCall()

                            console.log('acceptVideocall before send startClient...  state', $scope.state)

                        },
                        function (response) {
                            console.log(response);
                        }
                    );
        //    $scope.videoCallStarted = true
                           
        }
        $scope.forceVideoCall = function(){
            $scope.updateState("dashboard")
            console.log('forcingVideoCall')
            $scope.$broadcast('leaveRoom');
            $timeout( function(){
                $scope.joinRoom()
                $scope.updateState("videoCall.started")
            }, 1000 );
            
        }    

        $scope.joinToVideoCall = function() {
        //  $scope.outOfVideoCall()
          promiseVideocall = $interval($scope.getVideoCall, 2000)
        }
        $scope.outOfVideoCall = function() {
          console.log('outOfVideoCall')
          $interval.cancel(promiseVideocall)
          $scope.state.videoCall.out = true
          $scope.state.videoCall.started = false
        //  $scope.state.dashboard = true
        //  $rootScope.videoCall = {}
        }

        $scope.getVideoCall = function (){
            $scope.stopRinging()

            VideoCallClientFactory.query({videocallId: $rootScope.videoCall._id })
                .$promise.then(
                    function (response) {
                        $rootScope.videoCall = response
                        if($rootScope.videoCall.status === 3){
                            $scope.state.videoCall.nowRinging = false
                            $scope.openRatingDialog()
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
       
        $scope.joinRoom = function () {
          $scope.$broadcast('joinRoom');
          $scope.joinedRoom = true
          $scope.state.pendingVideocall = false
        }
        $scope.leaveRoom = function () {
            VideoCallFinishFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id }, {})
                .$promise.then(
                        function (response) {
                            $scope.$broadcast('leaveRoom')
                            $scope.outOfVideoCall()
                            $scope.openRatingDialog()
                        },
                        function (response) {
                            console.log(response);
                        }
                    )
        }
        $scope.doCall = function (){
             $scope.stopRinging()
             $scope.acceptVideocallDialog = ngDialog.open({ 
                                                            template: 'views/acceptVideocallDialog.html', 
                                                            scope: $scope, 
                                                            className: 'ngdialog-theme-default', 
                                                            controller:"AcceptCallClientController",
                                                            backdrop: 'static',
                                                            keyboard: false,
                                                            closeByEscape: false,
                                                            closeByDocument: false })
            
        }
        $rootScope.$on('peerConnectionLost', function(){
            console.log('peerConnectionLost', $rootScope.videoCall)
            var supercontainer = angular.element( document.querySelector( '#supercontainer' ) )[0]

                supercontainer.style['height'] = $scope.state.screen.height - 80 + 'px'
                supercontainer.style.background = 'black'
                $scope.state.videoCall.peerConnectionProblem = true

               
        })
        $rootScope.$on('peerConnectionAddedVideo', function(){
            $interval.cancel(promiseForceVideo)
        })
        $rootScope.$on('peerConnectionAdded', function(){
            console.log('peerConnectionAdded')
            $scope.state.videoCall.peerConnectionProblem = false
            $scope.state.videoCall.nowRinging = false
            var supercontainer = angular.element( document.querySelector( '#supercontainer' ) )[0]

                supercontainer.style['background'] = ''
                supercontainer.style['height'] = ''
                supercontainer.style['max-height'] = $scope.state.screen.height + 'px'
                console.log('$rootScope.videoWidth / $rootScope.videoHeight', $rootScope.videoWidth / $rootScope.videoHeight)
                console.log('(($rootScope.videoWidth / $rootScope.videoHeight) * $scope.state.screen.height) ', (($rootScope.videoWidth / $rootScope.videoHeight) * $scope.state.screen.height) )
                supercontainer.style['max-width'] = (($rootScope.videoWidth / $rootScope.videoHeight) * $scope.state.screen.height) + 'px'
                

            //    promiseForceVideo = $interval($scope.forceVideoCall, 5000)

        })
        $scope.openRatingDialog = function (){
             $scope.updateState("dashboard")
            if(!$scope.state.videoCall.dialogOpenned){
                $scope.state.videoCall.dialogOpenned = true
                $scope.ratingDialog = ngDialog.open({ 
                                                template: 'views/videocallRatingDialog.html', 
                                                scope: $scope, 
                                                className: 'ngdialog-theme-default', 
                                                controller:"RatingController",
                                                backdrop: 'static',
                                                keyboard: false,
                                                closeByEscape: false,
                                                closeByDocument: false })
            }
        }
        $rootScope.doRating = function(number){
            
            $scope.updateState("dashboard")

            VideoCallRatingFactory.save({userId: AuthFactory.getIduser(), videocallId:  $rootScope.videoCall._id }, {rating: number})
                .$promise.then(
                    function (response) {
                    //    ngDialog.close($rootScope.videocallOverviewDialog)
                        $scope.message = $filter('translate')('RATING_SENT_SUCCESSFULLY')
                      $rootScope.dialogMessageAndButton =  ngDialog.open({ 
                                                                    template: 'views/dialogMessageAndButton.html', 
                                                                    scope: $scope, 
                                                                    className: 'ngdialog-theme-default', 
                                                                    controller:"dialogMessageController",
                                                                    backdrop: 'static',
                                                                    keyboard: false });
                        
                    },
                    function (err) {
                        console.log(err);
                    }
            );
    } 
    $scope.playRinging = function() {

        if(!$scope.state.videoCall.nowRinging){
            $scope.state.videoCall.nowRinging = true

            $scope.audio = new Audio('audio/uniphone.wav');
                $scope.audio.addEventListener('ended', function() {
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
    $scope.stopRinging()

    $rootScope.doAcceptDialogButton = function () {
        console.log('doAcceptDialogButton')
        ngDialog.close( $rootScope.dialogMessageAndButton )
        $rootScope.videoCall = {}
        $rootScope.waitingRoom = {}
        $window.location.reload()
    }
        $scope.hoveringF = function (number){
           for(var i=0; i< $scope.hovering.length;i++){
                if(i < number){
                    $scope.hovering[i] = true
                }else{
                    $scope.hovering[i] = false
                }
           }
        }
        $scope.unhoveringF = function (number){
            for(var i=0; i< $scope.hovering.length;i++){
                $scope.hovering[i] = false
           }
        }

        $scope.toggleFullscreen = function() {


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
.controller('SelectPetDialogController', ['$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory',
    'VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory',
    'WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 'UserDetailsFactory', 
                function ($state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory,
                 VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, 
                 $stateParams,$timeout, $window, $scope, UserDetailsFactory) {
        
        UserDetailsFactory.query({ userId : AuthFactory.getIduser()})
            .$promise.then(
                function (response) {
                    $scope.user = response

                },
                function (err) {
                    console.log(err);
                //    $window.location.reload()
                }
            )

            $scope.selectPet = function(id){
                $rootScope.pet_selected = id;
                ngDialog.close( $rootScope.petSelectionDialog )
                $rootScope.checkUserCredits()
            }

}])

.controller('RatingController', ['$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory','VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function ($state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory, VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        
                    $scope.doRating = $rootScope.doRating

}])
.controller('dialogMessageController', ['$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory','VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function ($state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory, VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        
                    $scope.doAcceptDialogButton = $rootScope.doAcceptDialogButton

}])
.controller('AcceptCallClientController', ['$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory','VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function ($state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory, VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
        
                	$scope.acceptVideocall = $rootScope.acceptVideocall
                	$scope.cancelAcceptVideocallDialog = $rootScope.cancelAcceptVideocallDialog

}])
.controller('CreditsController', ['$state','VideoCallRatingFactory','ngDialog','VideoCallClientFactory','VideoCallFinishFactory', 'VideoCallClientStartFactory','$filter','$interval','AuthFactory','WaitingRoomFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
                function ($state, VideoCallRatingFactory,ngDialog, VideoCallClientFactory, VideoCallFinishFactory, VideoCallClientStartFactory,$filter,$interval, AuthFactory, WaitingRoomFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
                     
                    $scope.cancelCreditsDialog = $rootScope.cancelCreditsDialog

}])