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
        ctrl.emailotp=false;
        ctrl.emailsotp="";
        ctrl.loaded=false;
        ctrl.imagesection=false;
        ctrl.responseimage="";
        ctrl.show2fauth=false;
        ctrl.gotp="";
        ctrl.fotp="";
        ctrl.fpass="";
        ctrl.changepass=false;
        ctrl.emailrec="";
        ctrl.verifyemail=false;
    };

    ctrl.changepassword=function(){
      ctrl.changepass=true;
    };

    ctrl.changestate=function(params)
    {
        $state.go(params);
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
                                console.log("Api call success");
                                toaster.pop('success', 'Name', 'Success');
                                ctrl.emailotp=true;
                            }
                            else
                            {
                                toaster.pop('error', 'ERROR');
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

    ctrl.registeration=function(){
        if(ctrl.emailsotp.length===0)
        {
            toaster.pop('error', 'Name', 'Enter Any Details');
        }
        else
        {
            if(ctrl.emailsotp.length<6)
            {
                toaster.pop('error', 'OTP', 'Enter Correct OTP');
            }
            else {
                var data =
                    {
                        data: {
                            email: ctrl.email,
                            emailotp: ctrl.emailsotp
                        }
                    };
                MainService.verifyotp(data).then(function (res) {
                    if (res.status === 200) {
                        ctrl.emailotp=true;
                        toaster.pop('error', 'Name', 'Success');
                    }
                    else
                    {
                        toaster.pop('error', 'Error');
                        console.log("Check the internet connection");
                    }
                });
            }
        }
    };


    ctrl.login=function()
    {
        if($cookies.get("user")===undefined)
        {
            if(ctrl.email.length===0&&ctrl.password.length===0)
            {
                toaster.pop('error', 'Name', 'Enter Any Details');
            }
            else
            {
                if(ctrl.email.length===0)
                {
                    toaster.pop('error', 'Name', 'Enter the Email');
                }
                else if(ctrl.password.length===0)
                {
                    toaster.pop('error', 'Name', 'Enter the password');
                }
                else {
                    var data={
                        data:{
                            email:ctrl.email,
                            password:ctrl.password
                        }
                    };
                    MainService.login(data).then(function(response){
                        console.log(response);
                        if(response.status===200)
                        {
                            if(response.data.message=='SENT')
                            {
                                toaster.pop('error',"Email not verified yet!!");
                                toaster.pop('error',"OTP Sent to your email");
                                ctrl.emailotp=true;
                            }
                            else
                            {
                                toaster.pop('success',"Mobile is verification required");
                                ctrl.imagesection=true;
                                toaster.pop('error',"Scan this IMAGE IN GOOGLE AUTHENTICATOR");
                            }
                        }
                        else if(response.status===301)
                        {
                            toaster.pop('error',response.data.message);
                        }
                        else if(response.status===302)
                        {
                            toaster.pop('error',response.data.message);
                        }
                        else if(response.status===304)
                        {
                            toaster.pop('error',"Error in Sending OTP");
                        }
                        else if(response.status===305)
                        {
                            toaster.pop('success',"Mobile is not verified");
                            ctrl.imagesection=true;
                            toaster.pop('success',"Scan this IMAGE IN GOOGLE AUTHENTICATOR");
                        }
                        else
                        {
                            toaster.pop('error',response.data);
                        }
                    });
                }
            }
        }
        else
        {
            toaster.pop('error',"Already logged in");
        }
        ctrl.isloading=false;
    };


    ctrl.loginpage=function(){
        if(ctrl.emailsotp.length===0)
        {
            toaster.pop('error', 'Name', 'Enter Any Details');
        }
        else
        {
            if(ctrl.emailsotp.length<6)
            {
                toaster.pop('error', 'OTP', 'Enter Correct OTP');
            }
            else {
                var data =
                    {
                        data: {
                            email: ctrl.email,
                            emailotp: ctrl.emailsotp
                        }
                    };
                MainService.verifyotp(data).then(function (res) {
                    if (res.status === 200) {
                        $cookies.put("user" , response.data.message, { expires: new Date(Date.now()+ 7200000)});
                        toaster.pop('success', 'Login success');
                    }
                    else
                    {
                        console.log("Check the internet connection");
                    }

                });
            }
        }
    };
    ctrl.showimage=function()
    {
        console.log("done");
        ctrl.loaded=true;
        var data={
            "email":ctrl.email
        };
        MainService.getimage(data).then(function (res) {
            if (res.status === 200) {
                ctrl.responseimage = res.data.url;
                ctrl.show2fauth=true;
                toaster.pop('success', 'Loading....');
            }
            else if(res.status===301)
            {
                toaster.pop('error', 'Name', 'Error loading image');
            }
            else {
                console.log("Check the internet connection");
            }
        });
    };
    ctrl.googlecheck=function()
    {
        var data={
            "data":{
                "email":ctrl.email,
                "gotp":ctrl.gotp
            }
        };
        MainService.gverify(data).then(function (res) {
            if (res.status === 200) {
                /*
                                $cookies.put("user" , response.data.message, { expires: new Date(Date.now()+ 7200000)});
                */
                toaster.pop('success', 'Login success!!!');
            }
            else if(res.status===301)
            {
                toaster.pop('error',res.data.message);
            }
            else {
                console.log("Check the internet connection");
            }
        });
    };
    ctrl.forgotpass=function()
    {
        var data={
            "data":{
                "email":ctrl.emailrec
            }
        };
        console.log(ctrl.emailrec);
        MainService.forgot(data).then(function (res) {
            if (res.status === 200) {
                toaster.pop('success', 'Check email for the link');
                ctrl.verifyemail=true;
            }
            else if(res.status===301)
            {
                toaster.pop('error',res.data.message);
            }
            else {
                console.log("Check the internet connection");
            }
        });
    };
    ctrl.checkotp=function()
    {
        if(ctrl.emailrec.length===0)
        {
            toaster.pop('error', 'Name', 'Enter Any Details');
        }
        else
        {
            if(ctrl.fotp.length<6)
            {
                toaster.pop('error', 'OTP', 'Enter Correct OTP');
            }
            else {
                var data =
                    {
                        data: {
                            email: ctrl.emailrec,
                            emailotp: ctrl.fotp,
                            pass:ctrl.fpass
                        }
                    };
                MainService.verifyfotp(data).then(function (res) {
                    if (res.status === 200) {
                        toaster.pop('success', 'Successful');
                    }
                    else if (res.status === 301) {
                        toaster.pop('success', 'OTP ERROR');
                    }
                    else
                    {
                        console.log("Check the internet connection");
                    }

                });
            }
        }
    }
}

