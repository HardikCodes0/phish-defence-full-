const User = require('../models/users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/mail');

// REGISTER
exports.signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // create user
    const result = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Send welcome email (non-blocking)
    sendMail(email, 'Welcome to Phish Defense', `<h2>Welcome ${username} to Phish Defense!</h2><p>We are excited to have you on board.</p>`)
      .then(() => console.log(`Welcome email sent to ${email}`))
      .catch((err) => console.error(`Failed to send welcome email to ${email}:`, err));

    // generate token
    const token = jwt.sign(
      { _id: result._id, isAdmin: result.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(201).json({ user: result, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send login notification email (non-blocking)
    sendMail(user.email, 'Login Notification - Phish Defense', `<h2>Hello ${user.username},</h2><p>You have successfully logged in to your Phish Defense account. If this wasn't you, please contact support immediately.</p>`)
      .then(() => console.log(`Login notification email sent to ${user.email}`))
      .catch((err) => console.error(`Failed to send login notification email to ${user.email}:`, err));

    res.status(200).json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
