const express = require('express');
const { signup, login } = require('../controllers/authcontroller');
const passport = require('passport');

const router = express.Router();

// Routes
router.post('/register', signup);
router.post('/login', login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), (req, res) => {
  // Successful authentication, redirect or send token
  // Redirect to frontend with token and user info
  const { token, user } = req.user;
  // Send the full user object as a JSON string
  const FRONTEND_URL = "https://phishdefencelms.netlify.app";
  res.redirect(
    `${FRONTEND_URL}/login?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}`
  );
});

module.exports = router;
