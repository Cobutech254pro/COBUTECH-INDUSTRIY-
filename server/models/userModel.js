
// server/models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    // You can add more fields here, like timestamps, roles, etc.
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

const User = mongoose.model('User', userSchema);

module.exports = User;
