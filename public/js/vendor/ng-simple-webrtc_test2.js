(function (angular) {
  'use strict';
  if (!angular) {
    throw new Error('Missing Angular library');
  }

  angular.module('SimpleWebRTC', [])
    .run(function () {
      if (typeof SimpleWebRTC === 'undefined') {
        throw new Error('Cannot find SimpleWebRTC code');
      }
    })
    .directive('watchRoom', function () {
      return {
        template: '<div ng-show="joinedRoom">' +
          '<div id="remotes"></div>' +
          '</div>',
        scope: {
          roomName: '=',
          joinedRoom: '=',
          videoList: '=',
          maxNumPeers: '=',
          nick: '='
        },
        link: function (scope, element, attr) {
          scope.muted = attr.muted === 'true';
        },
        controller: function ($scope, $rootScope) {
          var webrtc, watchingVideo;

          $scope.maxNumPeers = typeof $scope.maxNumPeers === 'number' ?
            $scope.maxNumPeers : 10;

          function formRTCOptions() {
            var webrtcOptions = {
                autoRequestMedia: false,
                debug: false,
                nick: $scope.nick,
                receiveMedia: { // FIXME: remove old chrome <= 37 constraints format
                  mandatory: {
                      OfferToReceiveAudio: false,
                      OfferToReceiveVideo: true
                  }
                }
              };
            grabExtraWebRTCOptions(webrtcOptions);
            return webrtcOptions;            
          }

          function postCreationRTCOptions(webrtc) {
            //hola
          }

          function rtcEventResponses(webrtc) {
            webrtc.on('readyToCall', function () {
              console.log('webrtc ready to call');
            }); 
          
            webrtc.on('joinedRoom', function (name) {
              console.log('joined room "%s"', name);

              var peers = webrtc.getPeers();
              if (peers && Array.isArray(peers) &&
                peers.length > $scope.maxNumPeers) {
                console.error('Too many people in the room, leaving');
                webrtc.leaveRoom();
                $scope.$emit('room-full');
                return;
              }

              $scope.$emit('joinedRoom', name);
              console.log(peers)
              webrtc.on('channelMessage', function (peer, message) {
                console.log('received channel message "%s" from peer "%s"',
                  message, peer.nick || peer.id);
                $scope.$emit('channelMessage', peer, JSON.parse(message));
                $scope.$apply();
              });
            });
            $scope.$on('messageAll', function (event, message) {
              if (message && webrtc) {
                webrtc.sendDirectlyToAll(JSON.stringify(message));
              }
            });
            webrtc.on('videoRemoved', function (video, peer) {
              if (Array.isArray($scope.videoList)) {
                for (var i = 0; i < $scope.videoList.length; i++) {
                  if (video.id === $scope.videoList[i].id) {
                    $scope.videoList.splice(i, 1);
                    $scope.$apply();
                    return;
                  }
                }
              }
            });
            webrtc.on('videoAdded', function (video, peer) {
              console.log('video added from peer nickname', peer.nick);
              if ($scope.muted) {
                video.setAttribute('muted', true);
                video.setAttribute('hidden', true);
              }

              // videoList is an array, it means the user wants to append the video in it
              // so, skip manual addition to dom
              if (Array.isArray($scope.videoList)) {
                video.isRemote = true;
                $scope.videoList.push(video);
                $scope.joinedRoom = true;
                $scope.$apply();
                return;
              }

              var remotes = document.getElementById('remotes');
              remotes.appendChild(video);
              watchingVideo = video;

              $scope.$emit('videoAdded', video);
              $scope.joinedRoom = true;
              $scope.$apply();
            });

            webrtc.on('iceFailed', function (peer) {
              console.error('ice failed', peer);
              $scope.$emit('iceFailed', peer);
            });

            webrtc.on('connectivityError', function (peer) {
              console.error('connectivity error', peer);
              $scope.$emit('connectivityError', peer);
            });

            $scope.$on('leaveRoom', function leaveRoom() {
              console.log('leaving room', $scope.roomName);
              if (!$scope.roomName) {
                return;
              }

              webrtc.leaveRoom($scope.roomName);

              if (watchingVideo) {
                var remotes = document.getElementById('remotes');
                remotes.removeChild(watchingVideo);
              }
              $scope.joinedRoom = false;
            });
          }

          // emit this event, and we join the room.
          $scope.$on('joinRoom', function joinRoom() {
            console.log('joining room - ng-simple-webrtc.js', $scope.roomName);
            if (!$scope.roomName) {
              return;
            }

            var webrtcOptions = formRTCOptions();
            webrtc = new SimpleWebRTC(webrtcOptions);
            postCreationRTCOptions(webrtc);
            $rootScope.webrtc = webrtc;
            rtcEventResponses(webrtc);

            // Post WebRTC Options
            // And, a joinRoom command.

            webrtc.mute();
            webrtc.joinRoom($scope.roomName);
          });
        }
      }
    })

// ====================================================================================================================================

    .directive('broadcaster', function () {
      return {
      /*template: '<button id="screenShareButton"></button>' +
        '<p id="subTitle"></p>' +
        '<form id="createRoom">' +
        '   <input id="sessionInput"/>' +
        '    <button type="submit">Create it!</button>' +
        '</form>' +
        '<div class="videoContainer">' +
        '    <video id="localVideo" style="height: 150px;" oncontextmenu="return false;"></video>' +
        '    <div id="localVolume" class="volume_bar"></div>' +
        '</div>' +
        '<div id="remotes"></div>',
        scope: {
          hasStream: '=',
          roomName: '=',
          isBroadcasting: '=',
          sourceId: '=',
          minWidth: '=',
          minHeight: '=',
          videoList: '=',
          nick: '=' */
          template: '<div class="videoContainer">' +
        '    <video id="localVideo" style="height: 150px;" oncontextmenu="return false;"></video>' +
        '    <div id="localVolume" class="volume_bar"></div>' +
        '</div>' +
        '<div id="remotes"></div>',
        scope: {
          hasStream: '=',
          roomName: '=',
          isBroadcasting: '=',
          sourceId: '=',
          minWidth: '=',
          minHeight: '=',
          videoList: '=',
          nick: '='
        },
        link: function (scope, element, attr) {
          scope.mirror = attr.mirror === 'true';
          scope.muted = attr.muted === 'true';
        },
        controller: function ($scope, $rootScope) {
          var room = location.search && location.search.split('?')[1];
           var webrtc = new SimpleWebRTC({
                // the id/element dom element that will hold "our" video
                localVideoEl: 'localVideo',
                // the id/element dom element that will hold remote videos
                remoteVideosEl: '',
                // immediately ask for camera access
                autoRequestMedia: true,
                debug: false,
                detectSpeakingEvents: true
            });
            $scope.$on('leaveRoom', function leaveRoom() {
              console.log('leaving room', $rootScope.videoCall._id);
              if (!$rootScope.videoCall._id) {
                return;
              }
              webrtc.leaveRoom($rootScope.videoCall._id);

              $scope.joinedRoom = false
              webrtc.disconnect()
              webrtc.stopLocalVideo()
            })
            // when it's ready, join if we got a room from the URL
            webrtc.on('readyToCall', function () {
                // you can name it anything
                if (room) webrtc.joinRoom(room);
            });

            function showVolume(el, volume) {
                if (!el) return;
                if (volume < -45) { // vary between -45 and -20
                    el.style.height = '0px';
                } else if (volume > -20) {
                    el.style.height = '100%';
                } else {
                    el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
                }
            }
            webrtc.on('channelMessage', function (peer, label, data) {
                if (data.type == 'volume') {
                    showVolume(document.getElementById('volume_' + peer.id), data.volume);
                }
            });
            webrtc.on('videoAdded', function (video, peer) {
                console.log('video added', peer);
                hola
                var remotes = document.getElementById('remotes');
                if (remotes) {
                    var d = document.createElement('div');
                    d.className = 'videoContainer';
                    d.id = 'container_' + webrtc.getDomId(peer);
                    d.appendChild(video);
                    var vol = document.createElement('div');
                    vol.id = 'volume_' + peer.id;
                    vol.className = 'volume_bar';
                    video.onclick = function () {
                        video.style.width = video.videoWidth + 'px';
                        video.style.height = video.videoHeight + 'px';
                    };
                    d.appendChild(vol);
                    remotes.appendChild(d);
                }
            });
            webrtc.on('videoRemoved', function (video, peer) {
                console.log('video removed ', peer);
                var remotes = document.getElementById('remotes');
                var el = document.getElementById('container_' + webrtc.getDomId(peer));
                if (remotes && el) {
                    remotes.removeChild(el);
                }
                $rootScope.$broadcast('peerConnectionLost')
            });
            webrtc.on('volumeChange', function (volume, treshold) {
                //console.log('own volume', volume);
                showVolume(document.getElementById('localVolume'), volume);
            });

            // Since we use this twice we put it here
            function setRoom(name) {
                $('form').remove();
                $('h1').text(name);
                $('#subTitle').text('Link to join: ' + location.href);
                $('body').addClass('active');
            }

            if (room) {
                setRoom(room);
            } else {
              
              console.log('videocall', $rootScope.videoCall._id)
                    var val = $rootScope.videoCall._id
                    //var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
                    


                    webrtc.createRoom(val, function (err, name) {
                        console.log('createRoom err', err)
                        console.log('createRoom name', name)
                        console.log('createRoom create room cb', arguments);
                        setRoom(name);
                       
                    });
                 
            }

            var button = $('#screenShareButton'),
                setButton = function (bool) {
                    button.text(bool ? 'share screen' : 'stop sharing');
                };
            webrtc.on('localScreenStopped', function () {
                setButton(true);
            });

            setButton(true);

            button.click(function () {
                if (webrtc.getLocalScreen()) {
                    webrtc.stopScreenShare();
                    setButton(true);
                } else {
                    webrtc.shareScreen(function (err) {
                        if (err) {
                            setButton(true);
                        } else {
                            setButton(false);
                        }
                    });

                }
            });



         

         
        }
      };
    })
     .directive('broadcasterclient', function () {
      return {
      /*template: '<button id="screenShareButton"></button>' +
        '<p id="subTitle"></p>' +
        '<form id="createRoom">' +
        '   <input id="sessionInput"/>' +
        '    <button type="submit">Create it!</button>' +
        '</form>' +
        '<div class="videoContainer">' +
        '    <video id="localVideo" style="height: 150px;" oncontextmenu="return false;"></video>' +
        '    <div id="localVolume" class="volume_bar"></div>' +
        '</div>' +
        '<div id="remotes"></div>',
        scope: {
          hasStream: '=',
          roomName: '=',
          isBroadcasting: '=',
          sourceId: '=',
          minWidth: '=',
          minHeight: '=',
          videoList: '=',
          nick: '=' 
          template: '<div class="superVideoContainer"><div class="localVideoContainer">' +
        '    <video id="localVideo" oncontextmenu="return false;"></video>' +
        '    <div id="localVolume" class="volume_bar"></div>' +
        '</div>' +
        '<div id="remoteVideoContainer" class="remoteVideoContainer"></div></div>',*/
        template: '<div id="remoteVideoContainer" class="remoteVideoContainer">'+
                      '<div id="localVideoContainer" >'+
                      '    <video id="localVideo" oncontextmenu="return false;"></video>' +
                      '    <div id="localVolume" class="volume_bar"></div>' +
                      '</div></div>' ,


        scope: {
          hasStream: '=',
          roomName: '=',
          isBroadcasting: '=',
          sourceId: '=',
          minWidth: '=',
          minHeight: '=',
          videoList: '=',
          nick: '='
        },
        link: function (scope, element, attr) {
          scope.mirror = attr.mirror === 'true';
          scope.muted = attr.muted === 'true';
        },
        controller: function ($scope, $rootScope) {
          var watchingVideo
          var room = null

          if($rootScope.videoCall.roomCreated){
              room = $rootScope.videoCall._id
          }
          console.log('room in the beggining,', room)

          $scope.$on('leaveRoom', function leaveRoom() {
              console.log('leaving room', $rootScope.videoCall._id);
              if (!$rootScope.videoCall._id) {
                return;
              }

              webrtc.leaveRoom($rootScope.videoCall._id);

              
              $scope.joinedRoom = false
          //    webrtc.disconnect()
          //    webrtc.stopLocalVideo()
            })
          $scope.$on('audioOff', function (volume, treshold) {
                console.log('audioOff')
                webrtc.mute();
            });
            $scope.$on('audioOn', function (volume, treshold) {
              console.log('audioOn')
                webrtc.unmute();
            });

           var webrtc = new SimpleWebRTC({
                // the id/element dom element that will hold "our" video
                localVideoEl: 'localVideo',
                // the id/element dom element that will hold remote videos
                remoteVideosEl: '',
                // immediately ask for camera access
                autoRequestMedia: true,
                debug: false,
                detectSpeakingEvents: true
            });

            // when it's ready, join if we got a room from the URL
            webrtc.on('readyToCall', function () {
                // you can name it anything
                console.log('readyToCall')
                if (room) webrtc.joinRoom(room);
            });
            webrtc.on('joinRoom', function(){
          //    console.log('joiningRoom in ng-simple-webrtc')
          //      webrtc.joinRoom($rootScope.videoCall._id)
            })
            function showVolume(el, volume) {
                if (!el) return;
                if (volume < -45) { // vary between -45 and -20
                    el.style.height = '0px';
                } else if (volume > -20) {
                    el.style.height = '100%';
                } else {
                    el.style.height = '' + Math.floor((volume + 100) * 100 / 25 - 220) + '%';
                }
            }
            webrtc.on('channelMessage', function (peer, label, data) {
                if (data.type == 'volume') {
                    showVolume(document.getElementById('volume_' + peer.id), data.volume);
                }
            });
            webrtc.on('videoAdded', function (video, peer) {
                console.log('video added', video);
                var remotes = document.getElementById('remoteVideoContainer');
                var localVideoContainer = document.getElementById('localVideoContainer')
                var localVideo = document.getElementById('localVideo')
                var videoCallControls = document.getElementById("videocall-controls")
                var videoAdded = false

                if (remotes) {
                  console.log('remotes', remotes)
                    var d = document.createElement('div');
                    d.className = 'remoteVideo'
                    
                    d.id = 'container_' + webrtc.getDomId(peer);
                    d.appendChild(video);
                    watchingVideo = video
                    var vol = document.createElement('div');
                    vol.id = 'volume_' + peer.id;
                    vol.className = 'volume_bar';
                    video.oncanplay = function () {
                     
                      console.log('video oncanplay', video)
                      $rootScope.videoHeight = video.videoHeight
                      $rootScope.videoWidth = video.videoWidth
                     
                        videoCallControls.style.display = 'block'
                        localVideoContainer.className = 'localVideoContainer'
                        
                            
                        if($rootScope.screenWidth > $rootScope.screenHeight){
                          if(video.videoWidth < video.videoHeight){
                    // /        video.style.width = (video.videoWidth / video.videoHeight) * 100 + '%'
                                supercontainer.className = 'col-md-4 col-md-offset-4'
                          } 
                        }
                      
                      $rootScope.$broadcast('peerConnectionAddedVideo')
                    }
                    video.addEventListener("loadstart", function (cosa) { 
                        console.log('loadstart',cosa)
                    }, false)
                    video.addEventListener("durationchange", function (cosa) { 
                        console.log('durationchange',cosa)
                    }, false); 
                    video.addEventListener("loadedmetadata", function (cosa) { 
                        console.log('loadedmetadata',cosa)
                    }, false); 
                    video.addEventListener("loadeddata", function (cosa) { 
                        console.log('loadeddata',cosa)
                    }, false); 
                    video.addEventListener("progress", function (cosa) { 
                        console.log('progress',cosa)
                      /*  const playPromise = video.play();
                        if (playPromise !== null){
                            playPromise.catch(() => { video.play(); })
                        } */
                    }, false); 
                    video.addEventListener("canplaythrough", function (cosa) { 
                        console.log('canplaythrough',cosa)
                    }, false); 
              //     video.play()
              //video.load()
                    d.appendChild(vol);
                    remotes.appendChild(d);
               //     remotes.appendChild(localVideoContainer)
                    $rootScope.$broadcast('peerConnectionAdded')


                }
            });
            webrtc.on('videoRemoved', function (video, peer) {
                console.log('video removed ', peer);
                var remotes = document.getElementById('remoteVideoContainer');
                var el = document.getElementById('container_' + webrtc.getDomId(peer));
                if (remotes && el) {
                    remotes.removeChild(el);
                }
                $rootScope.$broadcast('peerConnectionLost')
            });
            webrtc.on('volumeChange', function (volume, treshold) {
                //console.log('own volume', volume);
                showVolume(document.getElementById('localVolume'), volume);
            });
            
            
            // Since we use this twice we put it here
            function setRoom(name) {
                $('form').remove();
                $('h1').text(name);
                $('#subTitle').text('Link to join: ' + location.href);
                $('body').addClass('active');
            }

            if (room) {
                console.log('no creating Room, just joinning', room)
                console.log('webrtc ->', webrtc)
                if(webrtc.connection.disconnected){
                  webrtc.connect()
                }
                setRoom(room);
            } else {
              
              console.log('creating Room _id:', $rootScope.videoCall._id)
              console.log('creating Room "room":', room)
                    var val = $rootScope.videoCall._id
                    //var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
                    


                    webrtc.createRoom(val, function (err, name) {
                        console.log('createRoom err', err)
                        console.log('createRoom name', name)
                        console.log('createRoom create room cb', arguments);
                        setRoom(name);
                       
                    });
                 
            }

            var button = $('#screenShareButton'),
                setButton = function (bool) {
                    button.text(bool ? 'share screen' : 'stop sharing');
                };
            webrtc.on('localScreenStopped', function () {
                setButton(true);
            });

            setButton(true);

            button.click(function () {
                if (webrtc.getLocalScreen()) {
                    webrtc.stopScreenShare();
                    setButton(true);
                } else {
                    webrtc.shareScreen(function (err) {
                        if (err) {
                            setButton(true);
                        } else {
                            setButton(false);
                        }
                    });

                }
            });


  
         

         
        }
      };
    });
 

}(window.angular));
