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
        }

    ];
    var app = angular.module('task',[
        'ui.router',
        'ngCookies',
        'ngAnimate',
        'toaster'
        ])
        .config(function($stateProvider,$urlRouterProvider){
            $urlRouterProvider.otherwise('/');
            angular.forEach(states,function(state){
                $stateProvider.state(state.name,state.state);
            });

        });
})();
