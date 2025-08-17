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
    required: function () {
      // Only require password if not a Google user
      return !this.isGoogleUser;
    },
    // ❌ No unique: true here, because multiple Google users may not have a password
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

// ✅ Ensure no unique index exists on password field
userSchema.index({ password: 1 }, { unique: false });

module.exports = mongoose.model('User', userSchema);
