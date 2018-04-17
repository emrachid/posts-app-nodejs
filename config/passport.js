const LocalStragegy = require('passport-local').Strategy;
const User = require('../models/user');
const config = require('../config/database');
const bcrypt = require('bcryptjs');

module.exports = (passport) => {
  // Local Strategy
  passport.use(new LocalStragegy((username, password, done) => {
    // Match username
    User.findOne({ username }, (err, user) => {
      if (err) throw err;
      if (!user) {
        return done(null, false, { message: 'User not found'});
      }

      // Match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Wrong password'});
        }
      });
    });
  }));

  // Passport will serialize and deserialize user from section cookies!!!
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Passport will serialize and deserialize user from section cookies!!!
  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

};
