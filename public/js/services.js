'use strict';

angular.module('confusionApp')
.constant("baseURL", "https://localhost:3445/")
//.constant("baseURL", "https://18.216.192.245:3445/")
.factory('AllPetsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "pets", {}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])
.factory('PetsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "pets/:petId", {petId:"@petId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])

.factory('RacesFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "races/:specieId", {specieId:"@specieId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])

.factory('SpeciesFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "species", {}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])

.factory('PaypalPlanUserFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "paypal/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])
.factory('PaypalPlanFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "paypal", {}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])
.factory('UserVideoCallsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/:userId/videocalls", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])
.factory('UserPaymentTestFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/payment/test/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('UserPaymentAndDetailsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/details/payment/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('UserPaymentDetailsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/payment/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('UserDetailsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/details/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('LanguageFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/language", {}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallOverviewFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/vet/:userId/overview", {videocallId:"@videocallId", 
                                                                                userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallRatingFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/client/:userId/rating", {videocallId:"@videocallId", 
                                                                                userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])

.factory('VideoCallClientFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/client", {videocallId:"@videocallId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallVetFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/vet", {videocallId:"@videocallId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallOverviewVetFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/vet/:userId/overview", {videocallId:"@videocallId", userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallRatingClientFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/client/:userId/rating", {videocallId:"@videocallId", userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallFinishFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/user/:userId/stop", {videocallId:"@videocallId", userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallClientStartFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/:videocallId/client/:userId/start/pet/:petId", 
        {videocallId:"@videocallId", userId:"@userId", petId:"@petId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('VideoCallVetStartFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "videocall/vet/:userId/start", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('WaitingRoomFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "waitingroom/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('usersFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "users/:userType", {userType:"@userType"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: true }
        });

}])
.factory('likedFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "liked", {}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('visitedFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "visited", {}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('visitedNewsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "visited", {}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('commentMoreCommentsFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "comments/noticias/:newId/page/:pageNumber", {newId:"@newId", pageNumber:"@pageNumber"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('newUpFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "noticias/up/:newId", {newId:"@newId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('newPageFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "noticias/pages/:pageNumber", {pageNumber :"@pageNumber"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('newCategoryPageFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "noticias/category/:categoryName/page/:pageNumber", 
                      {categoryName :"@categoryName",pageNumber :"@pageNumber"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('newFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "noticias/:newId", {newId:"@newId"}, {
            'update': {
                method: 'PUT'
            },
            'query': {
              method: 'GET',
              isArray: false }
        });

}])
.factory('commentFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "comments/:commentId", {commentId:"@commentId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('task_phoneFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "task_phone/:task_phoneId", {task_phoneId:"@task_phoneId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('menuFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

        return $resource(baseURL + "dishes/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('taskgroupFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "taskgroup/users/:userId", {userId:"@userId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('updatetaskgroupFactory', ['$http','$resource', 'baseURL', function ($http,$resource, baseURL) {
     
      $http.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type';
      $http.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST,PUT, OPTIONS';
      $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

      return $resource(baseURL + "taskgroup/:taskgroupId", {taskgroupId:"@taskgroupId"}, {
            'update': {
                method: 'PUT'
            }
        });
     

       

}])
.factory('taskFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "tasks/taskgroup/:taskgroupId", {taskgroupId:"@taskgroupId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('searchPhoneFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "phones/search/:name/:taskgrouId", {name:"@name",taskgroupId:"@taskgroupId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('phoneFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "phones/:phoneId", {phoneId:"@phoneId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])
.factory('updateTaskFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
     
      return $resource(baseURL + "tasks/:taskId", {taskId:"@taskId"}, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('newphoneFactory', ['$resource', 'baseURL','$http', function ($resource, baseURL, $http) {

       
        return $resource(baseURL + "phones/taskgroup/:taskgroupId", {taskgroupId:"@taskgroupId"}, {
            'update': {
                method: 'PUT'
            }
        });
        


}])
.factory('phonesByTaskFactory', ['$resource', 'baseURL','$http', function ($resource, baseURL, $http) {

       
        return $resource(baseURL + "phones/task/:taskId", {taskId:"@taskId"}, {
            'update': {
                method: 'PUT'
            }
        });
        


}])


.factory('promotionFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

    return $resource(baseURL + "promotions/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('corporateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "leadership/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])


.factory('favoriteFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "favorites/:id", null, {
            'update': {
                method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
        });

}])

.factory('feedbackFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


    return $resource(baseURL + "feedback/:id", null, {
            'update': {
                method: 'PUT'
            }
        });

}])

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    }
}])

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL',  function($resource, $http, $localStorage, $rootScope, $window, baseURL){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var iduser = 0;
    var authToken = undefined
    var user_type = 0
    var showLogin = false
    var lang = ''
    var credentials
    $http.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type';
    $http.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

  function loadUserCredentials() {
    credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    console.log(JSON.stringify(credentials))
    if (credentials.username != undefined) {
      useCredentials(credentials); 
    }
  }
 
  function storeUserCredentials(credentials) {
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    isAuthenticated = true;
    username = credentials.username;
    iduser = credentials.iduser;
    authToken = credentials.token;
    user_type = credentials.user_type
    showLogin = credentials.showLogin
    lang = credentials.lang
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    iduser = '';
    user_type = 0
    lang = ''
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
   authFac.destroyUserCredentials = function (){
    destroyUserCredentials()
   }
    authFac.login = function(loginData) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
            console.log('login', JSON.stringify(response))
              storeUserCredentials({username:loginData.username, token: response.token,iduser: response.iduser, user_type: response.user_type, redirectLogin: true, lang: response.lang});
              $rootScope.$broadcast('login:Successful');
              $rootScope.iduser = response.iduser;
              $rootScope.lang = response.lang
              $rootScope.username = loginData.username
           },
           function(response){
              isAuthenticated = false;
              $rootScope.$broadcast('login:Unsuccessful', response);
           }
        
        );

    }
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
       // $http.defaults.headers.common['Accept-Language'] = registerData.lang;
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
             // authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
              $rootScope.$broadcast('registration:Successful', response);
           },
           function(response){
              console.log(response)
              $rootScope.$broadcast('registration:Unsuccessful', response);

           }
        
        );
    }
    authFac.registerAdmin = function(registerData) {
       // $http.defaults.headers.common['Accept-Language'] = registerData.lang;
        $resource(baseURL + "users/register-admin")
        .save(registerData,
           function(response) {
             // authFac.login({username:registerData.username, password:registerData.password});
              $rootScope.$broadcast('registrationAdmin:Successful', response);
           },
           function(response){
              console.log(response)
              $rootScope.$broadcast('registrationAdmin:Unsuccessful', response);

           }
        
        );
    }
    authFac.forgot = function(forgotData) {
        $resource(baseURL + "users/forgot")
        .save(forgotData,
           function(response) {
              $rootScope.$broadcast('forgot:Successful', response);
           },
           function(response){
              isAuthenticated = false;
              $rootScope.$broadcast('forgot:Unsuccessful', response);
           }
        );
    }
    authFac.reset = function(resetData) {
        $resource(baseURL + "users/reset/" + resetData.token)
        .save(resetData,
           function(response) {
              $rootScope.$broadcast('reset:Successful', response);
           },
           function(response){
              isAuthenticated = false
              $rootScope.$broadcast('reset:Unsuccessful', response)
           }
        );
    }
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };
    authFac.getIduser = function() {
        return iduser;  
    }
    authFac.getUser_type = function() {
        return user_type;  
    }
    authFac.getLang = function() {
        return lang;  
    }
    
    authFac.setLang = function(lang){
      var cred = $localStorage.getObject(TOKEN_KEY,'{}')
      cred.lang = lang
      console.log('cred', cred)
      storeUserCredentials(cred)
    }
    authFac.getShowLogin = function() {
        return showLogin;  
    }
    loadUserCredentials();
    
    return authFac;
    
}])
;
