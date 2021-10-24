var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
app.use(cookieParser());

// middleware is applied in order they are used
function auth(req, res, next) {
  // console.log to see what is in it
  console.log(req.headers);
  // if the authHeader is null(empty), we first set an error
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    // first set error so if user does not put in a user name and pwd.
      const err = new Error('You are not authenticated!');
      // use a response header requesting authentication and the type is basic authentication
      res.setHeader('WWW-Authenticate', 'Basic');
      // standard statis error code is 401 when credentials have not be provided.
      err.status = 401;
      // pass the error message to express to handle sending the error message and authentication request back to the client
      return next(err);
  }

  // autherization header contains the username and pwd "Basic - in a base 64 encoded string"
  // parse login and pwd from headers
  // 
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  // Parce user name and pwd
  const user = auth[0];
  const pass = auth[1];
  // verify login and pwd are set and correct
  if (user === 'admin' && pass === 'password') {
      return next(); // authorized
  } else {
    // Access denied...
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');      
      err.status = 401;
      return next(err);
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