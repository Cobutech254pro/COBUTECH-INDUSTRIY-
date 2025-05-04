const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the sign-up route
router.post('/signup', authController.signup);

// Define the route to send verification code
router.post('/send-verification-code', authController.sendVerificationCode);

// Define the route to verify the code
router.post('/verify-code', authController.verifyCode);

module.exports = router;
