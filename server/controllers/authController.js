const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
const User = require('../models/userModel');
const { generateToken } = require('../utils/tokenUtils'); 
const transporter = require('../config/emailConfig'); 
const crypto = require('crypto'); 

const verificationCodes = {}; 


const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ error: 'Email already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, accountStatus: 'pending' });

        const verificationCode = generateVerificationCode();
        newUser.verificationCode = verificationCode;
        newUser.verificationCodeExpires = Date.now() + 24 * 3600 * 1000; 

        await newUser.save();

        await this.sendVerificationCode(newUser.email, verificationCode);
        res.status(201).json({ message: 'Registration successful. Please check your email to verify your account.' });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to register user.' });
    }
};

exports.sendVerificationCode = async (email, code) => {
    const mailOptions = {
        to: email,
        subject: 'Account Verification Code',
        html: `<p>Your verification code is: <strong>${code}</strong></p>
               <p>This code will expire in 24 hours.</p>`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification code sent to ${email}`);
    } catch (error) {
        console.error('Error sending verification code:', error);
        
    }
};

exports.verifyAccount = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email and verification code are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(200).json({ message: 'Account already verified.' });
        }

        if (user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired verification code.' });
        }

        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        user.accountStatus = 'active';
        await user.save();

        res.status(200).json({ message: 'Account verified successfully. You can now log in.' });

    } catch (error) {
        console.error('Account verification error:', error);
        res.status(500).json({ error: 'Failed to verify account.' });
    }
};

exports.login = async (req, res) => {
    const { email, password, remember } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (user.accountStatus !== 'active') {
            return res.status(403).json({ error: 'Your account is not active.' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ error: 'Email not verified. Please verify your account.' });
        }

        const authToken = generateToken(user._id);

        res.status(200).json({ message: 'Login successful', token: authToken });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User with this email not found.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; 
        await user.save();

        const resetLink = `${req.headers.origin}/reset-password/${resetToken}`; 
        const mailOptions = {
            to: user.email,
            subject: 'Password Reset Request',
            html: `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>
                   <p>This link will expire in 1 hour.</p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent successfully.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send password reset email.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully. You can now log in with your new password.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
};
