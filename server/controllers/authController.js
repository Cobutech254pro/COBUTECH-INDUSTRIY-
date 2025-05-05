const User = require('../models/userModel.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const transporter = require('../config/emailConfig.js');

const verificationCodes = {};
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
};

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful. Please verify your email.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });

  const cooldownWindow = verificationCodes[email];
  if (cooldownWindow && Date.now() < cooldownWindow.expiry - 30000) {
    return res.status(429).json({ error: 'Please wait before requesting another code.', retryAfter: 20 });
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

    res.status(200).json({ message: 'Verification code sent.', expiresIn: 60 });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send verification code.' });
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
    await User.findOneAndUpdate({ email }, { isEmailVerified: true, accountStatus: 'active' });
    delete verificationCodes[email];
    res.status(200).json({ message: 'Email verified.' });
  } catch (err) {
    res.status(500).json({ error: 'Verification update failed.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password,
password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials.' });

    if (!user.isEmailVerified)
      return res.status(403).json({ error: 'Email not verified.' });

    const token = generateToken(user._id);
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed.' });
  }
};
      
