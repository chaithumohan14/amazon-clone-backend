const User = require("./models/User");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      await User.findOne({ username: username })
        .then(async (user) => {
          if (user) {
            await bcrypt.compare(password, user.password).then((result) => {
              if (result === true) {
                return done(null, user);
              } else {
                return done(null, false);
              }
            });
          } else {
            return done(null, false);
          }
        })
        .catch((err) => {
          if (err) throw err;
        });
    })
  );
  passport.serializeUser((user, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser((id, cb) => {
    User.findOne({ _id: id }, (err, user) => {
      cb(err, user);
    });
  });
};
