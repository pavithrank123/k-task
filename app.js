var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var index = require('./server/routes/index');
var cors = require('cors');

var app = express();
var allowedOrigins = ['http://localhost',
    'http://www.techofes.org.in',
    'http://192.168.0.1',
    'https://www.techofes.org.in',
    'http://techofes.org.in',
    'https://techofes.org.in',
    'http://35.200.151.5',
    'https://auth.techofes.org.in',
    'http://localhost:8081',
    'http://192.168.0.103:8081'
];
app.use('/', express.static(__dirname + '/client'));
app.use(cors({
    origin: function(origin, callback){
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1){
            console.log(origin);
            var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
            callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET','POST'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],

    credentials: true
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next();
});

app.use('/', index);

app.set('port', (process.env.PORT || 80));

app.listen(app.get('port'), function(){
    console.log('Server started on port '+app.get('port'));
});
module.exports = app;
