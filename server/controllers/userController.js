var Usermodel=require('../model/model.js');
var sendotp=require('./otpcontroller.js');
var resmsg = {
    message: "",
    value:"",
    status:""
};
module.exports.registerController=function(req,res){
    try{
         if(req.body.data.hasOwnProperty('email')&&req.body.data.hasOwnProperty('password')&&req.body.data.hasOwnProperty('mobile')) {
            var password = req.body.data.password;
            var email = req.body.data.email;
            var mobile=req.body.data.mobile;
            var obj= {
                'email':req.body.data.email,
                'mobile':req.body.data.mobile,
                'password':req.body.data.password
            };
            Usermodel.checkUser(obj, function (data) {
                if (data === "present") {
                    resmsg.message = "The user already exists";
                    res.status(301).json(resmsg);
                }
                else {
                    Usermodel.createUser(obj, function (data)
                    {
                        if (data.status === "success")
                        {
                            otpdata={
                                "data":{
                                "email":email
                                }
                            };
                            sendotp.sendemailotp(otpdata,res);
                        }
                        else
                        {
                            resmsg.message = "Error in creating user, Try again after Sometime";
                            res.status(403).json(resmsg);
                        }
                    });
                }
            });
        }
        else
        {
            resmsg.message = "Invalid Credentials";
            res.status(403).json(resmsg);
        }
    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);
    }
};
