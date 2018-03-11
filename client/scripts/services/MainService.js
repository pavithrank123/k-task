(function(){
    angular.module('task').factory("MainService",MainService);
    MainService.$inject=['$http'];
    function MainService($http){
        var service={};
        service.register=register;
        service.login=login;
        service.getimage=getimage;
        service.verifyotp=verifyotp;
        service.verifyfotp=verifyfotp;
        service.logout=logout;
        service.gverify=gverify;
        service.forgot=forgot;
        return service;
        function register(data){
            return $http.post('http://localhost:8080/register',data).then(successfunction,failurefunction);
        }
        function forgot(data){
            return $http.post('http://localhost:8080/forgot',data).then(successfunction,failurefunction);
        }
        function logout(data){
            return $http.post('http://localhost:8080/logout',data).then(successfunction,failurefunction);
        }
        function getimage(data){
            return $http.post('http://localhost:8080/image',data).then(successfunction,failurefunction);
        }
        function gverify(data){
            return $http.post('http://localhost:8080/gverify',data).then(successfunction,failurefunction);
        }
        function verifyotp(data){
            return $http.post('http://localhost:8080/verifyotp',data).then(successfunction,failurefunction);
        }
        function verifyfotp(data){
            return $http.post('http://localhost:8080/verifyfotp',data).then(successfunction,failurefunction);
        }
        function login(data){
            return $http.post('http://localhost:8080/login',data).then(successfunction,failurefunction);
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
