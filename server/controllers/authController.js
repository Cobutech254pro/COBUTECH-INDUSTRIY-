const admin = require('firebase-admin');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken'); // For creating authentication tokens

const verificationCodes = {};
const requestCooldown = {};
const requestCounts = {};
const COOLDOWN_DURATION = 120000; // 120 seconds
const CODE_EXPIRY_DURATION = 60000; // 60 seconds
const MAX_REQUESTS = 3;
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Replace with a strong, secure secret

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email address is already registered.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user in the database
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isEmailVerified: false
        });

        await newUser.save();

        req.userEmail = email; // Store email for verification flow
        return res.status(201).json({ message: 'Registration successful. Please verify your email.' });

    } catch (error) {
        console.error('Error during signup:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        return res.status(500).json({ error: 'Failed to create user.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (!user.isEmailVerified) {
            req.userEmail = email; // Store email for potential resend
            return res.status(403).json({ error: 'Email not verified. Please verify your email.' });
        }

        const token = generateToken(user._id);
        return res.json({ message: 'Login successful!', token });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Failed to login.' });
    }
};

exports.sendVerificationCode = async (req, res) => {
    const userEmail = req.userEmail || req.body.email; // Get email from session or request

    if (!userEmail) {
        return res.status(400).json({ error: 'Email address not found.' });
    }

    try {
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if user is blocked
        if (requestCooldown[userEmail] && requestCooldown[userEmail].blockUntil > Date.now()) {
            const timeLeft = Math.ceil((requestCooldown[userEmail].blockUntil - Date.now()) / 1000);
            return res.status(429).json({ error: `Too many attempts. You can request again after ${timeLeft} seconds.` });
        }

        // Initialize or increment request count
        requestCounts[userEmail] = (requestCounts[userEmail] || 0) + 1;

        if (requestCounts[userEmail] > MAX_REQUESTS) {
            requestCooldown[userEmail] = { blockUntil: Date.now() + BLOCK_DURATION };
            delete requestCounts[userEmail]; // Reset attempts after blocking
            return res.status(429).json({ error: `Too many requests. You are blocked for 24 hours.` });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[userEmail] = { code: verificationCode, expiry: Date.now() + CODE_EXPIRY_DURATION };
        requestCooldown[userEmail] = requestCooldown[userEmail] || {};
        requestCooldown[userEmail].lastRequest = Date.now();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Your Email Verification Code',
            html: `<p>Your 6-digit verification code is: <strong>${verificationCode}</strong>. This code will expire in 1 minute.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Verification code sent' });

    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ error: 'Failed to send verification code.' });
    }
};

exports.verifyCode = async (req, res) => {
    const { code } = req.body;
    const userEmail = req.userEmail || req.body.email; // Get email from session or request

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
            delete requestCooldown[userEmail];
            delete requestCounts[userEmail];
            res.json({ message: 'Email verified' });
        } catch (error) {
            console.error('Error updating user verification status:', error);
            res.status(500).json({ error: 'Failed to update verification status.' });
        }
    } else {
        res.status(400).json({ error: 'Invalid verification code.' });
    }
};
