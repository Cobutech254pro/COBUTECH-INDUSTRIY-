const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Define the sign-up route
router.post('/signup', authController.signup);

// You'll add other authentication routes here later (e.g., /login)

module.exports = router;
