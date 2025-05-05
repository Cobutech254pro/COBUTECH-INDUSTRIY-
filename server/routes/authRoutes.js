const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-code', authController.verifyCode);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword); // Assuming you handle the token in the request body

// If you render the reset password form on a GET request with a token:
// router.get('/reset-password', authController.renderResetPasswordForm);

module.exports = router;
