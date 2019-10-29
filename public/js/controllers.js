'use strict';

angular.module('confusionApp')
.constant('TASK_STATUS', ['Sem enviar', 'Enviando', 'Enviado OK', 'Erro'])

.filter('resumeFilter', function(){
    return function(input, max, optional2) {

    var output;
    if(input.length > max){
        output = input.substring(0,max) + " ...";
    }else{
        output = input;
    }
    return output;

  }
})


.controller('HomeController', ['$location','ngDialog','$state','$filter','$rootScope','$timeout','$window','$scope', 'AuthFactory', 
            function ($location, ngDialog, $state, $filter, $rootScope, $timeout, $window, $scope, AuthFactory) {

    
    $scope.showForgot = false
    $scope.showLogin = false
    $scope.showRegister = true
    $rootScope.dialogConfirmationShown = false

    if($state.current.name === 'app.login'){
        $scope.showRegister = false
        $scope.showForgot = false
        $scope.showLogin = true
        var loginMsg = $state.params.loginMsg;

        if(loginMsg && loginMsg.length > 0 && !$rootScope.dialogConfirmationShown){
            $rootScope.dialogMessage = loginMsg
            $rootScope.dialogConfirmationShown = true
            $scope.confirmationDialog = ngDialog.open({ template: 'views/dialog_message.html', scope: $scope, className: 'ngdialog-theme-default', controller:"DialogMessageController",backdrop: 'static',keyboard: false });
         
        }
    }else{
        $scope.showRegister = true
        $scope.showForgot = false
        $scope.showLogin = false
    }

    $scope.loggedIn = false;
    $scope.username = '';
    $rootScope.iduser = '';
    // REGISTER
    
    $scope.registeringNow = false
    $scope.registerMsg = ''
    $scope.showRegisteringSpinner = false
    $scope.registerData = {
        username: '',
        password: '',
        confirmPassword: '',
        lang: $rootScope.lang.split("_")[1]
    }
    $scope.showUsernameError = false
    $scope.usernameErrorMsg = ''
    $scope.showPasswordError = false
    $scope.passwordErrorMsg = ''

    //LOGIN
    $scope.loginNow = false
    $scope.loginMsg = ''
    $scope.showLoginSpinner = false
    $scope.loginData = {
        username: '',
        password: '',
        lang: $rootScope.lang.split("_")[1]
    }
    //FORGOT
    $scope.forgotNow = false
    $scope.forgotMsg = ''
    $scope.showForgotSpinner = false
    $scope.forgotData = {
        username: ''
    }
    //FORGOT
    $scope.resetNow = false
    $scope.resetMsg = ''
    $scope.showResetSpinner = false
    $scope.resetData = {
        password: '',
        confirmPassword: '',
        token: ''
    }
    $scope.doRefresh = function(){
     // /   $location.url('/#/login')
        $scope.confirmationDialog.close()
        $state.go('app.login', {}, {inherit:false})
    }
    if(AuthFactory.isAuthenticated()) {
        $scope.showRegister = false
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
        $rootScope.iduser = AuthFactory.getIduser();
        $scope.user_type = AuthFactory.getUser_type();
        $scope.showRegister = !AuthFactory.getShowLogin()
        $scope.showLogin = AuthFactory.getShowLogin()
        if($scope.user_type == 1){
            $state.go('app.admin', {}, {})
        }else if($scope.user_type == 2){
            $state.go('app.vet', {}, {})
        }else if($scope.user_type == 3){
            $state.go('app.client', {}, {})
        }
    }
    $scope.changeForm = function(register, login, forgot){
        $scope.showRegister = register
        $scope.usernameErrorMsg = ''
        $scope.showUsernameError = false
        $scope.passwordErrorMsg = ''
        $scope.showPasswordError = false
        $scope.showForgot = forgot
        $scope.showLogin = login
    }    

    $scope.doRegister = function() {
        $scope.registeringNow = true
        $scope.showRegisteringSpinner = true
        $scope.registerMsg = $filter('translate')('REGISTER_PROCESSING')
        $scope.registerData.lang = $rootScope.lang.split("_")[1]
        AuthFactory.register($scope.registerData);
    }
    $scope.doLogin = function() {
        $scope.loginNow = true
        $scope.showLoginSpinner = true
        $scope.loginMsg = $filter('translate')('LOGIN_PROCESSING')
        $scope.loginData.lang = $rootScope.lang.split("_")[1]
        AuthFactory.login($scope.loginData);
    }
    $scope.doForgot = function (){
        $scope.forgotNow = true
        $scope.showForgotSpinner = true
        $scope.forgotMsg = $filter('translate')('FORGOT_PROCESSING')
        AuthFactory.forgot($scope.forgotData)
    }
    $scope.doReset = function (){
        $scope.resetNow = true
        $scope.showResetSpinner = true
        $scope.resetData.token = $state.params.token
        $scope.resetMsg = $filter('translate')('RESET_PROCESSING')
        AuthFactory.reset($scope.resetData)
    }
    
    $rootScope.$on('login:Successful', function () {
        
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $rootScope.iduser = AuthFactory.getIduser();
        $rootScope.Taskgroup = null;
        $rootScope.users = null;
        $state.go($state.current, {}, {reload: true});
    });
    $rootScope.$on('login:Unsuccessful', function (event, errors) {
      //$scope.registerMsg = errors
      $scope.loginNow = false
      $scope.showLoginSpinner = false
      console.log(errors)
      if(errors.data.err){
        const err = errors.data.err
        $scope.usernameErrorMsg = err
        $scope.showUsernameError = true
        
      }
    });    
    $rootScope.$on('registration:Successful', function (event, msg) {
    /*  $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
        $rootScope.iduser = AuthFactory.getIduser();
        $rootScope.Taskgroup = null;
        $rootScope.users = null;
        $state.go($state.current, {}, {reload: true});
    */
        $scope.registerMsg = msg.msg
        $scope.registeringNow = true
        $scope.showRegisteringSpinner = false

    });
    $rootScope.$on('registration:Unsuccessful', function (event, errors) {
      //$scope.registerMsg = errors
      $scope.registeringNow = false
      $scope.showRegisteringSpinner = false
      
      if(errors.data.errors){
        const err = errors.data.errors
        for(var i=0; i<err.length;i++){
            if(err[i].param === "username"){
                $scope.usernameErrorMsg = err[i].msg
                $scope.showUsernameError = true
            }else if(err[i].param === "password"){
                $scope.passwordErrorMsg = err[i].msg
                $scope.showPasswordError = true
            }
        }
        
      }
    })
    $rootScope.$on('forgot:Successful', function (event, message) {
        $scope.forgotNow = true
        $scope.showForgotSpinner = false
        $scope.forgotMsg = message.msg
    })
    $rootScope.$on('reset:Successful', function (event, message) {
        $scope.resetNow = true
        $scope.showResetSpinner = false
        $scope.resetMsg = message.msg
        $rootScope.dialogMessage = message.msg
        $state.go('app.login', {loginMsg : message.msg }, {location: 'replace'})
    })
    $rootScope.$on('reset:Unsuccessful', function (event, message) {
        $scope.resetNow = true
        $scope.showResetSpinner = false
        $scope.resetMsg = message.data.msg
        
    })
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
}])
.controller('DialogMessageController', ['$rootScope', '$stateParams','$timeout','$window','$scope', function ($rootScope, $stateParams,$timeout, $window, $scope) {
        console.log('DialogMessageController')
        $scope.message = $rootScope.dialogMessage
}])
.controller('AdminController', ['PaypalPlanFactory','$state','$filter','AuthFactory','usersFactory','$rootScope', '$stateParams','$timeout','$window','$scope', 
    function (PaypalPlanFactory, $state, $filter, AuthFactory,usersFactory, $rootScope, $stateParams,$timeout, $window, $scope) {
    
    if(AuthFactory.getUser_type() != 1){
        $state.go('app')
    }
    $scope.state = {
        paypal: false
    }

    $scope.errorMsg = ''
    $scope.users= []
    $scope.username = AuthFactory.getUsername()
    $scope.registerData = {
        username: '',
        password: '',
        confirmPassword: '',
        admin : false,
        client: false,
        vet: false,
        lang: $rootScope.lang.split("_")[1]
    }
    $scope.paypalPlan = {}

    $scope.doRegisterAdmin = function() {
        $scope.state.paypal = false

        if($scope.registerData.admin || $scope.registerData.vet){
            $scope.registeringNow = true
            $scope.showRegisteringSpinner = true
            $scope.registerMsg = $filter('translate')('REGISTER_PROCESSING')
            $scope.registerData.lang = $rootScope.lang.split("_")[1]
            AuthFactory.registerAdmin($scope.registerData)
        }else{
            $scope.registerMsgError = $filter('translate')('ERROR_TYPE_ACCOUNT_NOT_SELECTED')
        }
    }

    $scope.getAdmins = function (){
        $scope.state.paypal = false
            usersFactory.query({userType: 1})
                .$promise.then(
                    function (response) {
                        $scope.users = addUserRole(response)
                    }, function (err) {
                        $scope.errorMsg = err
                    })
    }
    $scope.getVets = function (){
        $scope.state.paypal = false
            usersFactory.query({userType: 2})
                .$promise.then(
                    function (response) {
                        $scope.users = addUserRole(response)
                    }, function (err) {
                        $scope.errorMsg = err
                    })
    }
    $scope.getClients = function (){
        $scope.state.paypal = false
            usersFactory.query({userType: 3})
                .$promise.then(
                    function (response) {
                        $scope.users = addUserRole(response)
                    }, function (err) {
                        $scope.errorMsg = err
                    })
    }
    $scope.getPaypalPlan = function(){
        PaypalPlanFactory.query({})
                    .$promise.then(function(response){
                        $scope.paypalPlan = response
                        $scope.state.paypal = true
                    }, function(err){

                    })
    }
    $scope.doPaypalPlan = function(){
        PaypalPlanFactory.save({})
                    .$promise.then(function(response){
                        $scope.paypalPlan = response
                        $scope.state.paypal = true
                    }, function(err){

                    })
    }
    


    $scope.createPaypalPlan = function(){
        PaypalPlanFactory.save({})
                    .$promise.then(function(response){
                        $scope.state.paypal = true
                        $scope.paypalPlan = response
                    }, function(err){

                    })
    }
    function addUserRole(users){

        for(var i=0; i<users.length; i++){
            if(users[i].admin){
                users[i].userRole = $filter('translate')('ROLE_ADMIN')
            }else if(users[i].vet){
                users[i].userRole = $filter('translate')('ROLE_VET')
            }else if(users[i].client){
                users[i].userRole = $filter('translate')('ROLE_CLIENT')
            }
        }
        return users
    }
    $rootScope.$on('registrationAdmin:Successful', function (event, msg) {
        $scope.registerMsg = msg.msg
        $scope.registeringNow = true
        $scope.showRegisteringSpinner = false
    });
    $rootScope.$on('registrationAdmin:Unsuccessful', function (event, errors) {
      //$scope.registerMsg = errors
      $scope.registeringNow = false
      $scope.showRegisteringSpinner = false
      
      if(errors.data.errors){
        const err = errors.data.errors
        for(var i=0; i<err.length;i++){
            if(err[i].param === "username"){
                $scope.usernameErrorMsg = err[i].msg
                $scope.showUsernameError = true
            }else if(err[i].param === "password"){
                $scope.passwordErrorMsg = err[i].msg
                $scope.showPasswordError = true
            }
        }
        
      }else if(errors.data.err){
            $scope.registeringErrorMsg = errors.data.err.msg
      }
    })

}])
.controller('CategoryController', ['likedByCategoryFactory','visitedByCategoryFactory','$rootScope', '$stateParams','$timeout','$window','newCategoryPageFactory','newFactory','$scope', 'menuFactory', 'corporateFactory', 'promotionFactory', function (likedByCategoryFactory,visitedByCategoryFactory,$rootScope, $stateParams,$timeout, $window,newCategoryPageFactory, newFactory, $scope, menuFactory, corporateFactory, promotionFactory) {
    
}])


.controller('newController', ['visitedByCategoryFactory','$window','$timeout','$location','visitedNewsFactory','newUpFactory','commentMoreCommentsFactory','$state','updateTaskFactory','$rootScope','$scope', '$localStorage', 'AuthFactory','$stateParams','newFactory','commentFactory', function (visitedByCategoryFactory, $window,$timeout, $location, visitedNewsFactory, newUpFactory, commentMoreCommentsFactory, $state,updateTaskFactory, $rootScope, $scope,  $localStorage, AuthFactory, $stateParams, newFactory, commentFactory) {    
    
    $scope.noticia;
    $scope.newCommentData = {};
    $scope.showCommentForm = true;
    $scope.messageOkComment = '';
    $scope.showVoteNewUp = true;
    $scope.showVoteNewDown = true;
    $scope.pageNumber = 1;
    $scope.showMoreCommentsButton = true;
    $scope.showMoreCommentsInfo = false;
    $scope.visitedNews = [];
    $scope.isHoverDown = new Object();
    $scope.isHoverUp = new Object();
    $scope.votedCommentUp = new Object();
    $scope.votedCommentDown = new Object();
    $scope.isLink = false;


        if($location.absUrl().includes('lnoticias')){
            $scope.isLink = true;
        }

        function getVisitedNewsByCategory(categoryName){
            
                    visitedByCategoryFactory.query({categoryName: categoryName})
                            .$promise.then(
                                function(response){
                                   $scope.visitedNews = response;
                                   
                                }, function(response){
                                    console.log(JSON.stringify(response));
                                });
        }
        newFactory.query({newId: ((typeof $stateParams.noticiaId == "undefined") ? ($location.absUrl().split('lnoticias')[1].replace('/', '').replace('/', '').replace('#', '')) : ($stateParams.noticiaId))})
                .$promise.then(
                    function (response) {
                        $scope.noticia = response;
                        if($scope.noticia.urlToImage.includes('images/logo-')){
                           $scope.noticia.urlToImage  = (($location.absUrl().includes('lnoticias') && !$scope.noticia.urlToImage.includes("http://noticieiro.com/images"))? ('../') : ('')) + $scope.noticia.urlToImage;
                        }
                        $rootScope.logo_image = (($location.absUrl().includes('lnoticias'))? ('../') : ('')) + 'images/logo-' + response.category.name + '.png';
                        $rootScope.currentCategory = $scope.noticia.category;
                        $scope.categoryName = $scope.noticia.category.name;

                        if($scope.noticia.comments.length == 0){
                            $scope.showMoreCommentsButton = false;
                        }
                        getVisitedNewsByCategory($scope.noticia.category.name);
                    },
                    function (response) {
                        console.log(response);
                    }
                );
        $scope.getMoreComments = function (){
            $scope.pageNumber++;
            commentMoreCommentsFactory.query({pageNumber : $scope.pageNumber , newId : $scope.noticia._id})
                .$promise.then(
                    function (response) {
                        if(response.docs.length > 0){
                            $scope.noticia.comments.push.apply($scope.noticia.comments,response.docs);
                        }else{
                            $scope.showMoreCommentsButton = false;
                            $scope.showMoreCommentsInfo = true;
                        }
                        
                    },
                    function (response) {
                        console.log(response);
                    }
                );
        }
        $scope.upNew = function(){

            if($scope.showVoteNewDown && $scope.showVoteNewUp){

                $scope.noticia.up ++;
                newFactory.update({newId : $scope.noticia._id}, $scope.noticia)
                    .$promise.then(
                            function (response) {
                                $scope.showVoteNewUp = false;
                            },
                            function (response) {
                                console.log(response);
                            }
                        );
            }
        }
        
        $scope.downNew = function(){
            
            if($scope.showVoteNewDown && $scope.showVoteNewUp){
            
                $scope.noticia.down ++;
                newFactory.update({newId : $scope.noticia._id}, $scope.noticia)
                    .$promise.then(
                            function (response) {
                                $scope.showVoteNewDown = false;
                            },
                            function (response) {
                                console.log(response);
                            }
                        );
            }
        }
        $scope.upNewComment= function(comment_id) {
             if(!$scope.votedCommentUp[comment_id] && !$scope.votedCommentDown[comment_id]){
                var comment = {};
                for(var i=0; i< $scope.noticia.comments.length; i++){
                    if($scope.noticia.comments[i]._id == comment_id){
                        $scope.noticia.comments[i].up ++;
                        comment = $scope.noticia.comments[i];
                        $scope.votedCommentUp[comment_id] = true;
                        break;
                    }
                }
                commentFactory.update({commentId : comment_id}, comment);
            }
        }
        $scope.downNewComment= function(comment_id) {
            if(!$scope.votedCommentUp[comment_id] && !$scope.votedCommentDown[comment_id]){
                var comment;
                for(var i=0; i< $scope.noticia.comments.length; i++){
                    if($scope.noticia.comments[i]._id == comment_id){
                        $scope.noticia.comments[i].down ++;
                        comment = $scope.noticia.comments[i];
                        $scope.votedCommentDown[comment_id] = true;
                        break;
                    }
                }
                commentFactory.update({commentId : comment_id}, comment);
            }
        }
        $scope.doNewComment = function() {
            if(typeof $scope.newCommentData == "undefined" || $scope.newCommentData.author == ''|| $scope.newCommentData.author == ' '|| $scope.newCommentData.author == '  '){
                console.log('newCommentData', $scope.newCommentData);
                $scope.messageComment = 'Escreva seu nome';
            }else if(typeof $scope.newCommentData.description == "undefined" || $scope.newCommentData.description == ''|| $scope.newCommentData.description == ' '|| $scope.newCommentData.description == '  '){
                $scope.messageComment = 'Escreva seu comentário';

            }else{
            $scope.newCommentData.publishedAtTimeStamp = (new Date()).getTime();
            $scope.newCommentData.new = $scope.noticia._id;


            commentFactory.save({}, $scope.newCommentData)
                .$promise.then(
                        function (response) {
                            $scope.noticia.comments.unshift(response);
                            $scope.showCommentForm = false;
                            $scope.messageOkComment = 'Comentário adicionado';
                        },
                        function (response) {
                            console.log(response);
                        }
                    );
               
            }
        }
        $timeout( function(){
            $window.scrollTo(0, 0);
        }, 200);

}])
.directive('imageonload', function() {
    return {
        restrict: 'A',
        scope: {
            ngImageonload: '='
        },
        link: function(scope, element, attrs) {
               // console.log('image could not be loaded', element);
            element.bind('load', function() {
               // alert('image is loaded');
            });
            element.bind('error', function(){
                var categoryName = 'general';
                if(typeof  scope.noticia != "undefined"){
                    categoryName = scope.noticia.category.name;
                }else if(typeof  scope.categoryName != "undefined"){
                    categoryName = scope.categoryName;
                }


               
            });
        }
    };
})
.directive('adsheader', function() {
    return {
        restrict: 'A',
        templateUrl: 'views/googleads/header.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adssponsor', function() {
    return {
        restrict: 'A',
        templateUrl: 'views/googleads/sponsor.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adsmainfeeds', function() {
    return {
        restrict: 'A',
        templateUrl: 'views/googleads/mainfeeds.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adspopular', function() {
    return {
        restrict: 'A',
        templateUrl: 'views/googleads/popular.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adsheaderlink', function() {
    return {
        restrict: 'A',
        templateUrl: '../views/googleads/header.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adssponsorlink', function() {
    return {
        restrict: 'A',
        templateUrl: '../views/googleads/sponsor.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adsmainfeedslink', function() {
    return {
        restrict: 'A',
        templateUrl: '../views/googleads/mainfeeds.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
})
.directive('adspopularlink', function() {
    return {
        restrict: 'A',
        templateUrl: '../views/googleads/popular.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
});

