(function(){
    'use strict';
    var states= [
        {
            name: 'Register',
            state:
                {
                    url:'/',
                    templateUrl: '../views/register.html',
                    data : {
                        text:"Register",
                        visible:false
                    }
                }
        },
        {
            name: 'Login',
            state:
                {
                    url:'/login',
                    templateUrl: '../views/login.html',
                    data : {
                        text:"Login",
                        visible:false
                    }
                }
        },
        {
            name: 'Display',
            state:
                {
                    url:'/image',
                    templateUrl: '../views/displayimage.html',
                    data : {
                        text:"Login",
                        visible:false
                    }
                }
        }

    ];
    var app = angular.module('task',[
        'ui.router',
        'ngCookies',
        'ngAnimate',
        'toaster'
        ])
        .config(function($stateProvider,$locationProvider,$httpProvider,$urlRouterProvider){
            $urlRouterProvider.otherwise('/');
            $httpProvider.defaults.withCredentials = true;
            angular.forEach(states,function(state){
                $stateProvider.state(state.name,state.state);
            });

        });
})();
