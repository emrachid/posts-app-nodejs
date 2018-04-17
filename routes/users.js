const express = require('express');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator/check');
const passport = require('passport');

// Bring in User model
const User = require('../models/user');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('register');
});

const registerUserValidator = [
  check('name', 'Name is required').isLength({ min: 1 }),
  check('email', 'Email is not valid')
    .isEmail()
    .custom((email, { req }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ email }, (err, user) => {
          if(err) {
            reject(new Error('Server Error'));
          }
          if(Boolean(user)) {
            reject(new Error('Email already in use. Please choose another one.'));
          }
          resolve(true);
        });
      });
    }),
  check('username', 'Username is required')
    .isLength({ min: 1 })
    .custom((username, { req }) => {
      return new Promise((resolve, reject) => {
        User.findOne({ username }, (err, user) => {
          if(err) {
            reject(new Error('Server Error'));
          }
          if(Boolean(user)) {
            reject(new Error('Username already in use. Please choose another one.'));
          }
          resolve(true);
        });
      });
    }),
  check('password', 'Password is required').isLength({ min: 1 }),
  check('password2', 'Password do not match')
    .isLength({ min: 1 })
    .custom((value, { req }) => value === req.body.password),
];

// Register new user
router.post('/register', registerUserValidator, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errors.array().map((error) => {
      req.flash('danger', error.msg);
    });
    res.redirect('/users/register');
    return;
  }

  // After input validation
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.log(err);
      req.flash('danger', err);
      res.redirect('/users/register');
      return;
    }
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
        req.flash('danger', err);
        res.redirect('/users/register');
        return;
      }
      // change plain text password to encrypted one before storing it
      newUser.password = hash;
      newUser.save((err) => {
        if (err) {
          console.log(err);
          req.flash('danger', err.errmsg);
          res.redirect('/users/register');
          return;
        } else {
          req.flash('success', 'You are now registered and can log in');
          res.redirect('/users/login');
        }
      });
    });
  });
});

// Login Form
router.get('/login', (req, res) => {
  res.render('login');
});

// Login Process
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true,
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
