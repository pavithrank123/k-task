var bcrypt = require('bcryptjs');
var dbConfig=require('../dbConfig.json');
var sql=require('mysql');
var connection = sql.createConnection(dbConfig.local);
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
    }
});

var salt=bcrypt.genSaltSync(10);

var rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

var token = function() {
    return rand() + rand(); // to make it longer
};
module.exports.checkUser=function (data,callback) {
    connection.beginTransaction(function(err) {
        if (err) {
            throw err;
        }
        var query = "select * from users where email=? or mobile=? ";
        var values = [data.email,data.mobile];
        connection.query(query,values, function (error, results, fields) {
            if (error){
                return connection.rollback(function() {
                    throw error;
                });
            }
            else {
                if (results.length != 0) {
                    connection.commit(function(err) {
                        if (err) {
                            return connection.rollback(function() {
                                throw err;
                            });
                        }});
                    callback("present");
                }
                else {
                    callback();
                }
            }
        });
    });
};

module.exports.createUser=function (data,callback) {
    try {
        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            var mobileno = data.mobile;
            var pass = data.password;
            var email = data.email;
            var hashed= bcrypt.hashSync(pass,salt);
            var uid = '_' + Math.random().toString(36).substr(2, 9);
            var query = "insert into  users (email,password,isonline,userid,mobile,created_at,updated_at) values (?,?,?,?,?,LOCALTIMESTAMP(),LOCALTIMESTAMP())";
            var values = [email, hashed, false, uid,mobileno];
            connection.query(query, values, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                else {
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        var resdata = {
                            "uid": uid,
                            "status": "success",
                            "id": results.insertId
                        };
                        console.log(results);
                        callback(resdata);

                    });
                }
            });
        });
    }catch(err)
    {
        console.log(err);
    }
};

module.exports.updateemailotp=function (data,callback) {
    try{
        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            var query = "select * from  emailauth where email = ?";
            var values = [data.email];
            connection.query(query, values,function (error, results, fields) {
                if (error){
                    return connection.rollback(function() {
                        throw error;
                    });
                }
                else {
                    if(results.length>0)
                    {
                        var query = "update emailauth set otp= ?,updated_at=LOCALTIMESTAMP() where email= ?";
                        var values = [data.otp,data.email];
                        connection.query(query,values, function (error, results, fields) {
                            if (error){
                                return connection.rollback(function() {
                                    throw error;
                                });
                            }
                            else {
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }});
                                callback("success");
                            }
                        });
                    }
                    else
                    {
                        var query = "insert into emailauth (email,otp,isverified,created_at,updated_at) values (?,?,?,LOCALTIMESTAMP(),LOCALTIMESTAMP())";
                        var values = [data.email,data.otp,false];
                        connection.query(query,values, function (error, results, fields) {
                            if (error){
                                return connection.rollback(function() {
                                    throw error;
                                });
                            }
                            else {
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }});
                                callback("success");
                            }
                        });
                    }
                }
            });
        });
    }catch(err)
    {
        console.log(err);
    }
};

module.exports.getotp=function (data,callback) {
    try {
        connection.beginTransaction(function(err) {
            if (err) {
                throw err;
            }
            var query = "select otp from emailauth where email=? LIMIT 1;";
            var value1=[data.email];
            connection.query(query,value1, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                if(results.length>0)
                {
                    if(data.otp===results[0].otp)
                    {
                        var query = "update emailauth set isverified=true where email=? LIMIT 1;";
                        var value2=[data.email];
                        connection.query(query,value2, function (error, results, fields) {
                            if (error) {
                                return connection.rollback(function () {
                                    throw error;
                                });
                            }
                            else
                            {
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }});
                                callback("success");
                            }
                        });
                    }
                    else
                    {
                        callback("error")
                    }
                }
                else
                {
                    callback("User credentials not found");
                }

            });

        });
    }
    catch(err)
    {
        console.log(err);
        callback();
    }
};


module.exports.checkUsername=function (obj,callback) {
    try{

        var data=obj.email.toString();
        var pass=obj.pass.toString();
        connection.beginTransaction(function(err) {
            if (err) {
                throw err;
            }
            var query = "select password,userid from users where email= '" + data + "' LIMIT 1;";
            connection.query(query, function (error, results, fields) {
                if (error){
                    return connection.rollback(function() {
                        throw error;
                    });
                }
                else {
                    if(results[0])
                    {
                        if(!bcrypt.compareSync(pass,results[0].password))
                        {
                            callback("Autherror");
                        }
                        else
                        {
                            callback(results[0].userid);
                        }
                    }
                    else {
                        callback();
                    }
                }
            });
        });
    }
    catch(err)
    {
        console.log(err);
    }
};


module.exports.verifyregister=function(data,callback)
{
    try{
        var query = "select isverified from emailauth where email= '" + data + "' LIMIT 1;";
        connection.query(query, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                if(results)
                {
                    callback(parseInt(results[0].isverified));
                }
                else
                {
                    callback("NO");
                }
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.verifymobile=function(data,callback)
{
    try{
        var query = "select  ismobileverified from users where email= '" + data + "' LIMIT 1;";
        connection.query(query, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                if(results.length>=0)
                {
                    callback(parseInt(results[0].ismobileverified));
                }
                else
                {
                    callback("NO");
                }
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.getimage=function(data,callback)
{
    try{
        var query = "select urlpath from users where email= '" + data + "' LIMIT 1;";
        connection.query(query, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                console.log(results);
                if(results!=undefined)
                {
                    callback(results[0].urlpath);
                }
                else
                {
                    callback("NO");
                }
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.getsecret=function(data,callback)
{
    try{
        var query = "select secret from users where email= '" + data + "' LIMIT 1;";
        connection.query(query, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                if(results!=undefined)
                {
                    callback(results[0].secret);
                }
                else
                {
                    callback("NO");
                }
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.getuserid=function(data,callback)
{
    try{
        var query = "select userid from users where email= '" + data + "' LIMIT 1;";
        connection.query(query, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                if(results)
                {
                    callback(results[0].userid);
                }
                else
                {
                    callback("NO");
                }
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.addsecret=function(data,callback)
{
    try{
        var query = "update users set secret=?,urlpath=? where email=? LIMIT 1;";
        var value2=[data.secret.base32,data.secret.otpauth_url,data.email];
        connection.query(query,value2, function (error, results, fields) {
            if (error) {
                return connection.rollback(function () {
                    throw error;
                });
            }
            else
            {
                connection.commit(function(err) {
                    if (err) {
                        return connection.rollback(function() {
                            throw err;
                        });
                    }});
                callback("success");
            }
        });
    }
    catch(err)
    {
        console.log(err);
    }
};


module.exports.assignToken=function (data,callback) {
    try{
        connection.beginTransaction(function(err) {
            if (err) {
                throw err;
            }
            var tok = token();
            var query = "select email from token where email='" + data + "' LIMIT 1;";
            //Checking whether the token is already present...
            connection.query(query, function (error, results, fields) {
                if (error){
                    return connection.rollback(function() {
                        throw error;
                    });
                }
                else {
                    //If it is already present.. Update it
                    if (results.length > 0) {
                        var query = "update token set updated_at=LOCALTIMESTAMP(),token='"+tok+"'where email='" + data + "';";
                        connection.query(query, function (error, results, fields) {
                            if (error){
                                return connection.rollback(function() {
                                    throw error;
                                });
                            }
                            else {
                                connection.commit(function(err) {
                                    if (err) {
                                        return connection.rollback(function() {
                                            throw err;
                                        });
                                    }});
                            }
                        });
                    }
                    else {
                        //If it is not present,, create a Token
                        var query = "insert into token values('"+data+"','" + tok + "',LOCALTIMESTAMP(),LOCALTIMESTAMP());";
                        connection.query(query, function (error, results, fields) {
                            if (error){
                                return connection.rollback(function() {
                                    throw error;
                                });
                            }
                            else {
                                var query = "update users set isonline=true where email='" + data + "';";
                                connection.query(query, function (error, results, fields) {
                                    if (error) {
                                        return connection.rollback(function() {
                                            throw error;
                                        });
                                    }
                                    else {
                                        connection.commit(function(err) {
                                            if (err) {
                                                return connection.rollback(function() {
                                                    throw err;
                                                });
                                            }});

                                    }
                                });
                            }
                        });
                    }
                    callback(tok);
                }
            });
        });
    }
    catch(err)
    {
        console.log(err);
    }
};

module.exports.updatepass=function (data,callback) {
    try {
        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            var pass = data.pass;
            var email = data.email;
            var hashed= bcrypt.hashSync(pass,salt);
            var query = "update users set password=?,updated_at=LOCALTIMESTAMP() where email=? LIMIT 1;";
            var values =  [hashed, email];
            connection.query(query, values, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                else {
                    connection.commit(function (err) {
                        if (err) {
                            return connection.rollback(function () {
                                throw err;
                            });
                        }
                        var resdata = {
                            "status": "success",
                            "id": results.insertId
                        };
                        console.log(results);
                        callback(resdata);

                    });
                }
            });
        });
    }catch(err)
    {
        console.log(err);
    }
};

module.exports.checkToken=function (data,callback) {
    try {
        connection.beginTransaction(function (err) {
            if (err) {
                throw err;
            }
            var query = "select users.userid from users join token on users.userid=token.userid where token.token ='" + data + "';";
            connection.query(query, function (error, results, fields) {
                if (error) {
                    return connection.rollback(function () {
                        throw error;
                    });
                }
                else {
                    if (results.length != 0) {
                        connection.commit(function (err) {
                            if (err) {
                                return connection.rollback(function () {
                                    throw err;
                                });
                            }
                        });
                        var user_id = results[0].userid;
                        var query = "update users set isonline=false where userid='" + user_id + "';";
                        connection.query(query, function (error, results, fields) {
                            if (error) {
                                return connection.rollback(function () {
                                    throw error;
                                });
                            }
                            else {
                                var query = "delete from token where token='" + data + "';";
                                connection.query(query, function (error, results, fields) {
                                    if (error) {
                                        return connection.rollback(function () {
                                            throw error;
                                        });
                                    }
                                    else {
                                        if (results.length != 0) {
                                            connection.commit(function (err) {
                                                if (err) {
                                                    return connection.rollback(function () {
                                                        throw err;
                                                    });
                                                }
                                            });
                                            callback(data);
                                        }
                                        else {
                                            callback();
                                        }
                                    }
                                });
                            }
                        });
                    }
                    else {
                        var query = "delete from token where token='" + data + "';";
                        connection.query(query, function (error, results, fields) {
                            if (error) {
                                return connection.rollback(function () {
                                    throw error;
                                });
                            }
                            else {
                                connection.commit(function (err) {
                                    if (err) {
                                        return connection.rollback(function () {
                                            throw err;
                                        });
                                    }
                                });
                                callback(data);
                            }
                        });
                    }
                }
            });
        });
    }
    catch (err) {
        console.log(err);
    }
};
