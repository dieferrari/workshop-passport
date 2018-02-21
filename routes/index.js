var express = require('express');
var router = express.Router();
const User = require('../models/user')
var passport = require('passport')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', function(req, res, next){
  res.render('form', {action: '/register'})
});

router.post('/register', function(req, res, next){
  User.create({ email: req.body.email, password: req.body.password })
  .then(()=> res.redirect('/login'))
});

router.get('/login', function(req, res, next){
  res.render('form', {action: '/login'})
});

router.post('/login', passport.authenticate('local', { successRedirect: '/private', failureRedirect: '/login'}));

router.get('/public', function(req, res, next){
  console.log(req.user);
  res.render('public')
});

router.get('/logout', function(req, res, next){
  console.log(req.user);
  req.logout();
  res.redirect('/public')
});

router.use('/private', function(req, res, next){
  if (req.isAuthenticated()) {
    next(); 
  } else {
    res.status(401).send('No tienes permiso para acceder a esta página')
  }
});

router.get('/private', function(req, res, next){
  res.render('private') 
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/private',
                                      failureRedirect: '/login' , 
                                    }));

module.exports = router;
