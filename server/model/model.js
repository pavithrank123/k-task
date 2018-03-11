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

};
