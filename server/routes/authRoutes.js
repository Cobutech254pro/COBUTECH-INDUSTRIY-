const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/send-verification-code', authController.resendVerificationEmail); // Corrected route name
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.renderResetPasswordForm);
router.post('/reset-password/:token', authController.resetPassword);

module.exports = router;
