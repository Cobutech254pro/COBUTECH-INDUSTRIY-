const User = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig.js');
const crypto = require('crypto'); // For generating random tokens

const verificationCodes = {};
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

// Function to generate a unique reset token
const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, accountStatus: 'pending' }); // Set initial status to pending
    await newUser.save();

    // Send verification code immediately after signup
    await this.sendVerificationCode({ body: { email: newUser.email } }, res);
    // The sendVerificationCode function will handle the response to the client
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const cooldownWindow = verificationCodes[email];
  if (cooldownWindow && Date.now() < cooldownWindow.expiry - 30000) {
    return res.status(429).json({ error: 'Please wait before requesting another code.', retryAfter: Math.ceil((cooldownWindow.expiry - Date.now()) / 1000) });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    verificationCodes[email] = { code, expiry: Date.now() + 60000 };

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`
    });

    // Respond only if the original request came directly to this function
    if (res && !res.headersSent) {
      res.status(200).json({ message: 'Verification code sent.', expiresIn: 60 });
    }
  } catch (error) {
    console.error('Send verification code error:', error);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'Failed to send verification code.' });
    }
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ error: 'Email and code are required.' });

  const stored = verificationCodes[email];
  if (!stored) return res.status(400).json({ error: 'No code found for this email.' });
  if (Date.now() > stored.expiry) return res.status(400).json({ error: 'Code expired.' });
  if (code !== stored.code) return res.status(400).json({ error: 'Invalid code.' });

  try {
    const user = await User.findOneAndUpdate({ email }, { isEmailVerified: true, accountStatus: 'active' }, { new: true });
    delete verificationCodes[email];
    const token = generateToken(user._id);
    res.status(200).json({ message: 'Email verified. Login successful.', token });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ error: 'Verification update failed.' });
  }
};

exports.login = async (req, res) => {
    const { email, password, remember } = req.body; // Expecting 'remember' from the front-end

    try {
        const user = await User.findOne({ email }).select('+password'); // Include the password field

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({ error: 'Email not verified. Please check your email to complete verification.' });
        }

        if (user.accountStatus !== 'active') {
            return res.status(403).json({ error: 'Your account is not active.' });
        }

        const expiresIn = remember ? '7d' : '1h'; // Example: 7 days if remember is true, 1 hour otherwise
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn });

        res.status(200).json({ message: 'Login successful', token });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed.' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' }); // Don't reveal if the email exists
        }

        const resetToken = generateResetToken();
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
        await user.save();

        const resetLink = `${req.headers.origin}/reset-password?token=${resetToken}`; // Construct the reset link

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
                   <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                   <p><a href="${resetLink}">${resetLink}</a></p>
                   <p>This link will expire in 1 hour.</p>
                   <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`
        });

        res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Failed to send password reset email. Please try again.' });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token and new password are required.' });
    }

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful.' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password.' });
    }
};
