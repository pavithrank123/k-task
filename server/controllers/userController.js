var speakeasy = require('speakeasy');
var QRCode = require('qrcode');
var fs = require("fs");
var Usermodel=require('../model/model.js');
var sendotp=require('./otpcontroller.js');
var resmsg = {
    message: "",
    value:"",
    status:"",
    url:""
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
                            var secret = speakeasy.generateSecret({length: 20});
                            var inp={
                                "email":req.body.data.email,
                                "secret":secret
                            };
                            Usermodel.addsecret(inp,function (res1) {
                                if(res1==='success')
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
                                    resmsg.message="Error!! Try Again";
                                    res.status(202).json(resmsg);
                                }
                            });

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

module.exports.verifyotp=function(req,res){
    try{
        if(req.body.data.hasOwnProperty('email')&&req.body.data.hasOwnProperty('emailotp')) {
            var data={
                "email":req.body.data.email,
                "otp":req.body.data.emailotp
            };
            Usermodel.getotp(data,function (data) {
                if(data==="success")
                {
                    resmsg.message="Email Verified";
                    res.status(200).json(resmsg);
                }
                else if(data==="error")
                {
                    resmsg.message="OTP Error";
                    res.status(201).json(resmsg);
                }
                else
                {
                    resmsg.message="Error!! Try Again";
                    res.status(202).json(resmsg);
                }
            })
        }
        else
        {

        }
    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);
    }
};
module.exports.verifyfotp=function(req,res){
    try{
        if(req.body.data.hasOwnProperty('email')&&req.body.data.hasOwnProperty('emailotp')) {
            var data={
                "email":req.body.data.email,
                "otp":req.body.data.emailotp,
                "pass":req.body.data.pass
            };
            Usermodel.getotp(data,function (data1) {
                if(data1==="success")
                {
                    Usermodel.updatepass(data,function (result) {
                        resmsg.message="Password Changed";
                        res.status(200).json(resmsg);
                    });
                }
                else if(data1==="error")
                {
                    resmsg.message="OTP Error";
                    res.status(201).json(resmsg);
                }
                else
                {
                    resmsg.message="Error!! Try Again";
                    res.status(202).json(resmsg);
                }
            })
        }
        else
        {

        }
    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);
    }
};





module.exports.loginController=function (req,res) {
    try{
        if(req.body.data.hasOwnProperty('email')&&req.body.data.hasOwnProperty('password'))
        {
            var x=req.cookies.user;
            if(x)
            {
                resmsg.message="You have already logged in ";
                res.status(301).json(resmsg);
            }
            else
            {
                var email= req.body.data.email;
                var password=req.body.data.password;
                var obj={
                    "email":email,
                    "pass":password
                };

                Usermodel.checkUsername(obj,function(data){
                    if(data==="Autherror")
                    {
                        resmsg.message="Authentication Error";
                        res.status(301).json(resmsg);
                    }
                    else if(data)
                    {
                        Usermodel.verifyregister(obj.email,function (result) {
                            if (result)
                            {
                                //Made for SMS verification
                                Usermodel.verifymobile(obj.email,function (result) {
                                    if (result)
                                    {
                                        res.sendStatus(200);

                                    }
                                    else
                                    {
                                        var otpdata={
                                            "data":{
                                                "email":email
                                            }
                                        };
                                        res.sendStatus(305);
                                    }
                                });
                            }
                            else
                            {
                                var otpdata={
                                    "data":{
                                        "email":email
                                    }
                                };
                                sendotp.sendemailotp(otpdata,res);
                            }
                        });
                    }
                    else
                    {
                        resmsg.message="User doesnot exist";
                        res.status(302).json(resmsg);
                    }
                });
            }
        }
        else
        {
            res.status(500);
        }

    }
    catch(err)
    {
        console.log(err);
    }

};


module.exports.qrcode=function(req,res)
{
    try {

        var secret = speakeasy.generateSecret({length: 20});
        console.log(secret.base32); // Save this value to your DB for the user
        QRCode.toDataURL(secret.otpauth_url, function (err, image_data) {
            console.log(image_data); // A data URI for the QR code image
            res.send(image_data);
        });
    }
    catch(err)
    {
        console.log(err);
    }
};


module.exports.image=function(req,res)
{
    try {
        Usermodel.getimage(req.body.email,function (result) {
            if(result)
            {
                console.log("The result is");
                console.log(result);
                QRCode.toDataURL(result, function (err, image_data) {
                    console.log(image_data); // A data URI for the QR code image
                    resmsg.url=image_data;
                    resmsg.message="found";
                });
            }
            else{
                resmsg.message="not found";
            }
        });
        res.status(200).json(resmsg);
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.gverify=function(req,res)
{
    try
    {
        if(req.body.data.hasOwnProperty('email')&&req.body.data.hasOwnProperty('gotp'))
        {
            Usermodel.getsecret(req.body.data.email,function (result) {
                if(result)
                {
                    var token = speakeasy.totp({
                        secret: result,
                        encoding: 'base32'
                    });
                    var verified = speakeasy.totp.verify({
                        secret: result,
                        encoding: 'base32',
                        token: req.body.data.gotp,
                        window: 2,
                        step:30
                    });
                    if(verified)
                    {
                        Usermodel.assignToken(req.body.data.email,function (data1) {
                            if(data1.length>0)
                            {
                                res.cookie("user" , data1, { expires: new Date(Date.now()+ 7200000)});
                                res.status(200).json(resmsg);
                            }
                            else
                            {
                                resmsg.message="Problem Logging in ";
                                res.status(301).json(resmsg);
                            }
                        });
                    }
                    else
                    {
                        resmsg.message="Incorrect OTP";
                        res.status(301).json(resmsg);
                    }
                }
                else{
                    resmsg.message="not found";
                    res.status(301).json(resmsg);
                }
            });
        }
        else
        {
            res.status(500);
        }

    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.forgot=function(req,res)
{
    try
    {
        if(req.body.data.hasOwnProperty('email'))
        {
            sendotp.sendemailotp(req.body.data,res);
        }
        else
        {
            res.status(500);
        }

    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.logoutController=function (req,res) {
    try{
        var x= req.cookies.user;
        if(x.length<=0)
        {
            res.sendStatus(500);
        }
        else
        {
            Usermodel.checkToken(x,function(data){
                if(data===x)
                {
                    console.log("logged out");
                }
                res.clearCookie("user");
                res.sendStatus(200);
            });
        }

    }
    catch(err)
    {
        console.log(err);
        res.sendStatus(500);

    }
};
