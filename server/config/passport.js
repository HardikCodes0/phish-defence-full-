const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Only initialize Google OAuth strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await User.findOne({ email: profile.emails[0].value });
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          isGoogleUser: true,
        });
      }
      // Attach user and JWT to req.user
      const token = jwt.sign({ _id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return done(null, { user, token });
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.log('⚠️  Google OAuth credentials not found. Google OAuth authentication will be disabled.');
} 