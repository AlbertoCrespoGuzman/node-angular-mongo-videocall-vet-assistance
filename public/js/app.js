'use strict';

angular.module('confusionApp', ['angularScreenfull', 'ngDialog','pascalprecht.translate', 'ui.router','ngResource', '720kb.socialshare', 'SimpleWebRTC'])

.config(function($translateProvider, $compileProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
         $translateProvider
                .useStaticFilesLoader({
                  prefix: 'translations/locale',
                  suffix: '.json'
                }).preferredLanguage('_es').useMissingTranslationHandlerLog().useSanitizeValueStrategy('escapeParameters');


        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller  : 'HeaderController'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HomeController'
                    },
                    'footer': {
                        templateUrl : 'views/footer.html',
                    }
                }

            })
            .state('app.login', {
                url: 'login/:loginMsg',
                views: {
                    'content@': {
                        templateUrl : 'views/home.html',
                        controller: 'HomeController'
                    }
                }
            })
            .state('app.reset', {
                url: 'reset/:token',
                views: {
                    'content@': {
                        templateUrl : 'views/reset_password.html',
                        controller: 'HomeController'
                    }
                }
            })
            .state('app.admin', {
                url: 'admin',
                views: {
                    'content@': {
                        templateUrl : 'views/adminDashboard.html',
                        controller: 'AdminController'
                    }
                }
            })
            .state('app.client', {
                url: 'client',
                views: {
                    'content@': {
                        templateUrl : 'views/client.html',
                        controller: 'ClientController'
                    }
                }
            })
            .state('app.profile', {
                url: 'profile',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/userDetails.html',
                            controller  : 'HeaderController'
                        }
                    }
                
            })
            .state('app.profile.details', {
                url: '/details',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/userDetails.html',
                            controller  : 'UserDetailsController'
                        }
                    }
                
            })
            .state('app.profile.pets', {
                url: '/pets',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/pets.html',
                            controller  : 'PetsController'
                        }
                    }
                
            })
            .state('app.profile.history', {
                url: '/history',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/historyAttendance.html',
                            controller  : 'HistoryAttendanceController'
                        }
                    }
                
            })
            .state('app.profile.payment', {
                url: '/payment',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/paymentDetails.html',
                            controller  : 'PaymentDetailsController'
                        }
                    }
                
            })
            .state('app.profile.delivery', {
                url: '/delivery',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/deliveryDetails.html',
                            controller  : 'DeliveryDetailsController'
                        }
                    }
                
            })
            .state('app.profile.messages', {
                url: '/messages',
                views: {
                    'sidebar@': {
                            templateUrl : 'views/sidebar.html',
                            controller  : 'SidebarController'
                    },
                    'content@': {
                        
                            templateUrl : 'views/messagesDetails.html',
                            controller  : 'MessagesController'
                        }
                    }
                
            })
            .state('app.vet', {
                url: 'vet',
                views: {
                    'content@': {
                        templateUrl : 'views/vet.html',
                        controller: 'VetController'
                    }
                }
            })
            .state('app.category', {
                url: 'categorias/:categoryName',
                views: {
                    'content@': {
                        templateUrl : 'views/home.html',
                        controller  : 'CategoryController'
                   }
                }
            })
            .state('app.noticias', {
                url: 'noticias/:noticiaId',
                views: {
                    'content@': {
                        templateUrl : 'views/new.html',
                        controller  : 'newController'
                   }
                }
            });
        $urlRouterProvider.otherwise('/');
      //  $locationProvider.html5Mode(true);
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|chrome-extension|whatsapp):/);
    })
;
