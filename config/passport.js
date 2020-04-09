// load all the things we need
var GitHubStrategy = require('passport-github').Strategy;

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function (passport) {

  // =========================================================================
  // passport session setup ==================================================
  // =========================================================================
  // required for persistent login sessions
  // passport needs ability to serialize and unserialize users out of session

  // used to serialize the user for the session
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      done(err, user);
    });
  });


  // =========================================================================
  // GitHub ==================================================================
  // =========================================================================
  passport.use(new GitHubStrategy(configAuth.githubAuth,
    function (req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function () {

        console.log('GITHUB - ', profile);

        // check if the user is already logged in
        if (!req.user) {

          console.log(profile);

          User.findOne({ 'github.id': profile.id }, function (err, user) {
            if (err)
              return done(err);

            if (user) {

              // if there is a user id already but no token (user was linked at one point and then removed)
              if (!user.github.token) {
                user.github.token = token;
              }

              user.github.displayName = profile.displayName;
              user.github.username = profile.username;
              user.github.avatar = (profile.photos[0].value || '');

              user.save(function (err) {
                if (err)
                  return done(err);

                return done(null, user);
              });
            } else {
              var newUser = new User();

              newUser.github.id = profile.id;
              newUser.github.token = token;
              newUser.github.displayName = profile.displayName;
              newUser.github.username = profile.username;
              newUser.github.avatar = (profile.photos[0].value || '');

              newUser.save(function (err) {
                if (err)
                  return done(err);

                return done(null, newUser);
              });
            }
          });

        } else {
          // user already exists and is logged in, we have to link accounts
          var user = req.user; // pull the user out of the session

          user.github.id = profile.id;
          user.github.token = token;
          user.github.displayName = profile.displayName;
          user.github.username = profile.username;
          user.github.avatar = (profile.photos[0].value || '');

          user.save(function (err) {
            if (err)
              return done(err);

            return done(null, user);
          });

        }

      });

    }));

};
