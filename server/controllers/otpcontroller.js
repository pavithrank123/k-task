var Usermodel=require('../model/model.js');
var nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    port:'80',
    auth: {
        user: 'kuttank97@gmail.com',
        pass: 'Pavi@123'
    }
});


transporter.use('compile', mailerhbs({
    viewPath: 'templates/emails', //Path to email template folder
    extName: '.hbs' //extendtion of email template
}));

module.exports.sendemailotp=function (req,res){
    if(req.data!=undefined&&req.data.hasOwnProperty("email"))
    {
        emailotp=Math.random(36).toString().slice(2,8);
        emaildata={
            "otp":emailotp,
            "email":req.data.email
        };

        const mailOptions = {
            from: 'kuttank97@gmail.com', // sender address
            to: emaildata.email, // list of receivers
            subject: 'OTP Verification @Kurukshetra 2k19', // Subject line
            template:'emailotp',
            context:{
                "otp":emailotp
            }
        };
        var resdata={
            message:""
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if(err)
                console.log(err);
            else
            {
                console.log(info);
                Usermodel.updateemailotp(emaildata,function (response) {
                    if(response==="success")
                    {
                        console.log("working");
                        resdata.message="SENT";
                        res.status(200).json(resdata);
                    }
                    else
                    {
                        resdata.message="Server Error in Sending OTP";
                        res.status(401).json(resdata);
                    }
                });
            }
        });
    }
};


