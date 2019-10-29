'use strict';

angular.module('confusionApp')

.controller('HeaderController', ['UserDetailsFactory','LanguageFactory','$http', '$translate','$timeout','$window','$scope', '$state', '$rootScope',  'AuthFactory', '$stateParams','$location', 
    function (UserDetailsFactory, LanguageFactory, $http, $translate,$timeout, $window, $scope, $state, $rootScope,  AuthFactory, $stateParams, $location) {

    $scope.loggedIn = false
    $scope.username = '';
    $rootScope.iduser = '';
    $scope.menuActive = false

    $rootScope.lang = "_es";

    $rootScope.screenHeight = $window.innerHeight
    $rootScope.screenWidth = $window.innerWidth
    $scope.userType = AuthFactory.getUser_type()



    if(AuthFactory.isAuthenticated()){
		UserDetailsFactory.query({userId: AuthFactory.getIduser() })
	            .$promise.then(
	                function (response) {
	                    response.details ? $rootScope.username = response.details.firstname + ' ' + response.details.lastname : AuthFactory.getUsername() 
	                    $rootScope.userDetails = response.details
	                },
	                function (err) {
	                    console.log(err);
                        AuthFactory.logout()
	                }
	        )
    }
    defineLanguage()
    function defineLanguage() {
        if(AuthFactory.isAuthenticated()){
            console.log('AuthFactory.getLang', AuthFactory.getLang())
            $rootScope.lang = "_" + AuthFactory.getLang()

        }else{
        if ($window.navigator.language.indexOf('en') >= 0) {
            $rootScope.lang = "_en";
          }else if ($window.navigator.language.indexOf('es') >= 0) {
            $rootScope.lang = "_es";
          }
        }  
        $translate.use($rootScope.lang);
        $http.defaults.headers.common['Accept-Language'] =  $rootScope.lang.split("_")[1]
    }
    $scope.changeLanguage = function (language){
        console.log('changeLanguage', language)
        if($scope.loggedIn){
            LanguageFactory.save({user_id: AuthFactory.getIduser(), lang: language})
                    .$promise.then(
                        function(response){
                           console.log('done', response.lang)
                           AuthFactory.setLang(response.lang)
                           $rootScope.lang = "_" + language
                            $translate.use($rootScope.lang)
                            $http.defaults.headers.common['Accept-Language'] =  $rootScope.lang.split("_")[1]
                           
                        }, function(response){
                            console.log(JSON.stringify(response));
                        })
        }else{
            $rootScope.lang = "_" + language
            $translate.use($rootScope.lang)
            $http.defaults.headers.common['Accept-Language'] =  $rootScope.lang.split("_")[1]
        }

        
    }
    //$scope.logo = (typeof $stateParams.noticiaId == "undefined") ? ($location.absUrl().split('lnoticias')[1].replace('/', '').replace('/', '').replace('#', '')) : ($stateParams.noticiaId))}
    $scope.showSpinner = true;
    var preloaderFadeOutTime = 1000;
    $timeout( function(){
           function hidePreloader() {
                $scope.startFade = true;
                $timeout(function(){
                    $scope.showSpinner = false;
                }, preloaderFadeOutTime);
            }
            hidePreloader()
        }, preloaderFadeOutTime )
  /*  $window.onload = function() {
             var preloaderFadeOutTime = 1000;
            function hidePreloader() {
                $scope.startFade = true;
                $timeout(function(){
                    $scope.showSpinner = false;
                }, preloaderFadeOutTime);
            }
            hidePreloader()
        } */

    var lazy = angular.element( document.querySelector( '#header.lazy-load' ) );
    
    $window.onscroll = function() {
        if ($(this).scrollTop() >= 200) {
     //       lazy.addClass('visible')
        } else {
     //       lazy.removeClass('visible')
        }
    }
    if(AuthFactory.isAuthenticated()) {
            $scope.loggedIn = true
            lazy.addClass('visible')
    }else{
        $scope.loggedIn = false
    }

   $scope.logOut = function() {
        console.log('logout')
        AuthFactory.logout()
        $scope.loggedIn = false;
        $scope.username = '';
        $rootScope.iduser = '';
        lazy.removeClass('visible')
        $window.location.reload()
        $state.go('app')
    }
    

    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };

}])
