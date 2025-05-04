const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

// In-memory storage for verification codes (replace with a more robust solution for production)
const verificationCodes = {};
const requestCooldown = {}; // Store last request time for each email
const COOLDOWN_DURATION = 120000; // 120 seconds in milliseconds
const CODE_EXPIRY_DURATION = 60000; // 60 seconds in milliseconds

// Nodemailer transporter (configure with your email service details)
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Example: Use your email service
    auth: {
        user: 'your-email@gmail.com', // Your email address
        pass: 'your-email-password' // Your email password or app-specific password
    }
});

exports.signup = async (req, res) => {
    const { email, name, password, firebaseUid, googleToken } = req.body;

    try {
        let uid = firebaseUid;

        if (!uid && email && password) {
            const firebaseUser = await admin.auth().createUser({
                email: email,
                password: password
            });
            uid = firebaseUser.uid;
        } else if (!uid && googleToken) {
            // Verify Google ID token if needed for extra security
            // const decodedToken = await admin.auth().verifyIdToken(googleToken);
            // uid = decodedToken.uid;
            // For simplicity, we'll trust the front-end for now after successful popup
            if (!req.body.name || !req.body.email) {
                return res.status(400).json({ error: 'Name and email are required for Google sign-in.' });
            }
        }

        if (!uid) {
            return res.status(400).json({ error: 'No Firebase UID provided.' });
        }

        const newUser = new User({
            firebaseUid: uid,
            name: name,
            email: email,
            isEmailVerified: false // Initially set to false
        });

        await newUser.save();

        req.userEmail = email; // Store email for verification flow
        return res.status(201).json({ message: 'Registration successful. Please verify your email.' });

    } catch (error) {
        console.error('Error during signup:', error);

        if (error.code === 'auth/email-already-in-use') {
            return res.status(409).json({ error: 'Email address is already in use.' });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({ error: 'Invalid email address.' });
        }
        if (error.code === 'auth/weak-password') {
            return res.status(400).json({ error: 'Password is too weak.' });
        }
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }

        return res.status(500).json({ error: 'Failed to create user.' });
    }
};

exports.sendVerificationCode = async (req, res) => {
    const { email } = req.body; // Assuming you send the email in the request

    const userEmail = email || req.userEmail; // Adjust based on your auth flow

    if (!userEmail) {
        return res.status(400).json({ error: 'Email address not found.' });
    }

    if (requestCooldown[userEmail] && Date.now() < requestCooldown[userEmail] + COOLDOWN_DURATION) {
        const timeLeft = Math.ceil((requestCooldown[userEmail] + COOLDOWN_DURATION - Date.now()) / 1000);
        return res.status(429).json({ error: `Too many requests. Please wait ${timeLeft} seconds before requesting a new code.` });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[userEmail] = { code: verificationCode, expiry: Date.now() + CODE_EXPIRY_DURATION };
    requestCooldown[userEmail] = Date.now(); // Update last request time

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: userEmail,
        subject: 'Your Email Verification Code',
        html: `<p>Your 6-digit verification code is: <strong>${verificationCode}</strong>. This code will expire in 1 minute.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ error: 'Failed to send verification code.' });
    }
};

exports.verifyCode = async (req, res) => {
    const { code } = req.body;
    const userEmail = req.userEmail; // Adjust based on how you identify the user

    if (!userEmail || !verificationCodes[userEmail]) {
        return res.status(400).json({ error: 'No verification code requested for this email or it has expired.' });
    }

    const storedCodeData = verificationCodes[userEmail];

    if (Date.now() > storedCodeData.expiry) {
        delete verificationCodes[userEmail];
        return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
    }

    if (code === storedCodeData.code) {
        try {
            await User.findOneAndUpdate({ email: userEmail }, { isEmailVerified: true });
            delete verificationCodes[userEmail];
            delete requestCooldown[userEmail]; // Clear cooldown on successful verification
            res.json({ message: 'Email verified' });
        } catch (error) {
            console.error('Error updating user verification status:', error);
            res.status(500).json({ error: 'Failed to update verification status.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid verification code.' });
    }
};
