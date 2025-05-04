const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },
  isEmailVerified: { type: Boolean, default: false },
  accountStatus: { type: String, enum: ['pending', 'active'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
