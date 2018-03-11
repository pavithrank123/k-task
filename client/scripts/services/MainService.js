(function(){
    angular.module('task').factory("MainService",MainService);
    MainService.$inject=['$http'];
    function MainService($http){
        var service={};
        service.register=register;
        service.login=login;
        service.logout=logout;
        return service;
        function register(data){
            return $http.post('http://localhost:8080/register',data).then(successfunction,failurefunction);
        }
        function logout(data){
            return $http.post('http://auth.techofes.org.in:80/logout',data).then(successfunction,failurefunction);
        }
        function login(data){
            return $http.post('http://auth.techofes.org.in:80/login',data).then(successfunction,failurefunction);
        }
        function successfunction(data){
            return data;
        }
        function failurefunction(err){
            console.log(err);
            return err;
        }
    }
})();
