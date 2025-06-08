// routes/loginRoutes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const loginController = require('../controllers/loginController');
const router = express.Router();

// Limitador de intentos de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes to tries
    max: 10, // only 10 tries
    message: { error: 'Too many attempts, try again later...' }
});

// rute POST to Login
router.post('/', loginLimiter, loginController.login);

module.exports = router;
