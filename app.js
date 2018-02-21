var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const session = require('express-session')
  , FacebookStrategy = require('passport-facebook').Strategy;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  {
    usernameField: 'email' 
  },

  function(username, password, done) {
    User.findOne({ where: { email: username }})
    .then((user)=> {
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.checkPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    }) 
     .catch((err)=> {
      if (err) { 
        return done(err); }
     }) 
  }
));

passport.use(new FacebookStrategy({
  clientID: "163687107616098",
  clientSecret: '1869f32e9905af67c8563c524f7b3c32',
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ['id', 'email', 'name'],
},
function(accessToken, refreshToken, profile, done) {
  User.findOrCreate({ where: { facebookId: profile.id }, defaults: {email: profile.emails[0].value, facebookId: profile.id}})
  .then((user) => { 
    console.log(user);
    done(null, user) })
  .catch((err) => { done(err); }) 
}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id) 
  .then((user) => { done(null, user) })
  .catch((err) => done(err))
});


app.use('/', index);
app.use('/users', users);

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
