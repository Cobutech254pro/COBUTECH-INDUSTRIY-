const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login); // Add the login route
router.post('/send-verification-code', authController.sendVerificationCode);
router.post('/verify-code', authController.verifyCode);

module.exports = router;
