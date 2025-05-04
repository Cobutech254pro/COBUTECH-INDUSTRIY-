const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true // Allows null or undefined values, but unique if present
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    accountStatus: {
        type: String,
        enum: ['pending', 'active', 'blocked'],
        default: 'pending'
    },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
