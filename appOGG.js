var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const FileStore = require('session-file-store')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/nucampsite';
const connect = mongoose.connect(url, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true, 
    useUnifiedTopology: true
});

connect.then(() => console.log('Connected correctly to server'), 
    err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('12345-67890-09876-54321'));

function auth(req, res, next) {
    // signedCookie provided by cookieParser, it will automatically parse a signed cookie from the request.
    //  if the cookie is not properly signed it will return a value of false. 
    // the additional property .user will be added to the assigned cookie. 
    if (!req.signedCookies.user) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
  
        const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
        const user = auth[0];
        const pass = auth[1];
        // user and pwd is challenged here. Sent back to the server.
        if (user === 'admin' && pass === 'password') {
        // res.cookie is a method is a response api. Used to create a new cookie by passing it the name we want to use for the cookie labeled 'user'.
        // and the name will be used to setup a property of user on the signed cookie object.
        // The second argument will be a value to store in a name property will be given a string 'admin'
        // third argument is optional holding a configuration values, let express to use the secret key from cookie parcer to create a signed cookie.
            res.cookie('user', 'admin', {signed: true});
            return next(); // authorized
        // If their is a signed cookie .user value , see if that value equals 'admin' else send error response.
        } else {
            const err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate', 'Basic');
            err.status = 401;
            return next(err);
        }
    } else {
        if (req.signedCookies.user === 'admin') {
            return next();
        } else {
            const err = new Error('You are not authenticated!');
            err.status = 401;
            return next(err);
        }
    }
}

app.use(auth);

// authentication is before express.static b/c users must authenticate before they are able to access any data from the server.
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// for any route that hits /users differ anything to the usersRouter
app.use('/users', usersRouter);
app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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