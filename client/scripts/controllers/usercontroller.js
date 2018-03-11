angular.module("task").controller("usercontroller",usercontroller);
usercontroller.$inject=['$state','toaster','MainService','$cookies','$timeout','$window'];
function usercontroller($state,toaster,MainService,$cookies,$timeout,$window) {
    ctrl=this;
    function isNumber(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }
    function validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email.toLowerCase());
    }

    ctrl.init=function () {
        ctrl.email= "";
        ctrl.mobile="";
        ctrl.password="";
        ctrl.cpassword="";

    };
    ctrl.register=function(){
        if(ctrl.email.length===0&&ctrl.mobile.length===0&&ctrl.password.length===0&&ctrl.cpassword.length===0)
        {
            toaster.pop('error', 'Name', 'Enter Any Details');
        }
        else {
                if(ctrl.email.length<4||!validateEmail(ctrl.email))
                {
                    toaster.pop('error', 'Email', 'Enter a valid email');
                }
                else {
                    if (ctrl.mobile.length != 10 || !isNumber(ctrl.mobile)) {
                        toaster.pop('error', 'Mobile Number', 'Enter a valid mobile number');
                    }
                    else {

                        if (ctrl.password === ctrl.cpassword) {
                            var data =
                                {
                                    data: {
                                        email: ctrl.email,
                                        password: ctrl.password,
                                        mobile: ctrl.mobile
                                    }
                                };
                            MainService.register(data).then(function (res) {
                                if (res.status === 200) {
                                   console.log("Api call success")
                                }
                                else
                                {
                                    console.log("Check the internet connection");
                                }

                            });
                        }
                        else {
                            toaster.pop('error', 'Passwords', 'Password Didnt match');
                        }
                    }
                }
        }
    };



}
