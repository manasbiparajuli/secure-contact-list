// required middlewares
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var bcrypt = require('bcrypt');
var expressValidator = require('express-validator');
var flash = require('connect-flash');

//build the database
//ensure that the database server is running
require('./database').build();


//hash the password 
var username = "cmps369";
var password = "finalproject";
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
        password = hash;
        console.log("hashed password = " + password);
    })
});


const index = require('./routes/index');
const mailer = require('./routes/mailer');
const contacts = require('./routes/contacts');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(cookieParser());
app.use(session({ secret: 'test' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());

//set up password for authentication
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    },

    function(user, pswd, done) {
        if (user != username) {
            console.log("Username mismatch");
            return done(null, false);
        }

        bcrypt.compare(pswd, password, function(err, isMatch) {
            if (err) return done(err);
            if (!isMatch) {
                console.log("Password mismatch");
            } else {
                console.log("Valid credentials");
            }
            done(null, isMatch);
        });
    }
));

passport.serializeUser(function(username, done) {
    done(null, username);
});

passport.deserializeUser(function(username, done) {
    done(null, username);
});


// Posts to login will have username/password form data.
// passport will call the appropriate functions...
app.post('/login',
    passport.authenticate('local', { successRedirect: '/contacts', failureRedirect: '/login_fail', }))

app.get('/login', function(req, res) {
    res.render('login', {});
});

app.get('/login_fail', function(req, res) {
    res.render('login_fail', {});
})

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

//add the route-handling code to the request handling chain
app.use('/', index);
app.use('/mailer', mailer);
app.use('/contacts', contacts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;