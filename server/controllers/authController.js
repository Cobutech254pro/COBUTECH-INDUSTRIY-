const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { generateToken } = require('../cofig/utils'); // Assuming you have this utility
const crypto = require('crypto');
const transporter = require('../config/emailConfig'); // Your email transporter

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Function to generate a unique verification token
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex'); // Generate a longer, more secure token
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: 'Email already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, accountStatus: 'pending' });

        const verificationToken = generateVerificationToken();
        newUser.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
        newUser.emailVerificationExpires = Date.now() + 24 * 3600 * 1000; // Token expires in 24 hours

        await newUser.save();

        await this.sendVerificationEmail(newUser, verificationToken, req); // Send verification email
        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
};

exports.sendVerificationEmail = async (user, token, req) => {
    const verificationLink = `${req.headers.origin}/api/auth/verify-email/${token}`; // Adjust the URL as needed

    const mailOptions = {
        to: user.email,
        subject: 'Account Verification',
        html: `<p>Thank you for registering!</p>
               <p>Please click the following link to verify your email address:</p>
               <p><a href="${verificationLink}">${verificationLink}</a></p>
               <p>This link will expire in 24 hours.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        // You might want to handle this error more gracefully, e.g., by allowing the user to request a new verification email.
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.params;

    if (!token) {
        return res.status(400).json({ error: 'Verification token is required.' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        user.accountStatus = 'active'; // Activate the account upon verification
        await user.save();

        const authToken = generateToken(user._id); // Optionally log the user in after verification
        res.status(200).json({ message: 'Email verified successfully. Your account is now active.', token: authToken });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ error: 'Failed to verify email.' });
    }
};

// Keep your login, forgotPassword, and resetPassword controllers as they are
// ... (rest of your authController.js) ...
