const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() {
      // Only require password if not a Google user
      return !this.isGoogleUser;
    },
  },
  isGoogleUser: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', userSchema);
