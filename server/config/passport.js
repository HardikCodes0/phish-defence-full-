const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/users');
const jwt = require('jsonwebtoken');

// Only initialize Google OAuth strategy if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://phish-defence-full.onrender.com/api/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      const email = profile?.emails?.[0]?.value;
      let user = await User.findOne({ email });

      if (!user) {
        // Ensure a unique username when creating a new Google user
        const baseFromDisplay = (profile?.displayName || '').toString().trim();
        const baseFromEmail = (email ? email.split('@')[0] : '').toString().trim();
        const base = baseFromDisplay || baseFromEmail || 'user';

        // slugify base to allowed characters
        const slug = base
          .toLowerCase()
          .replace(/[^a-z0-9_\-\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '') || 'user';

        let candidate = slug;
        let suffix = 0;
        // Try to find a unique username
        // Limit attempts to avoid infinite loop
        while (await User.exists({ username: candidate })) {
          suffix += 1;
          candidate = `${slug}${suffix}`;
          if (suffix > 1000) break;
        }

        user = await User.create({
          username: candidate,
          email,
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
