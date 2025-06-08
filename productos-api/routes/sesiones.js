const express = require('express');
const router = express.Router();
const path = require('path');
const sesiones = require('../controllers/sesiones');
const loginController = require('../controllers/loginController');
const rateLimit = require('express-rate-limit');

const noCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};

// limit access
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // 10 tries
    message: { error: 'Too many attemps, try later...' }
});

// API to verificate if the user already log
router.get('/api/session', sesiones.isAuthenticated, noCache, (req, res) => {
    res.json({
        authenticated: true,
        username: req.session.username
    });
});

// login
router.post('/api/login', loginLimiter, noCache, loginController.login);

// logout
router.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('[!] ERROR to destroy the session', err);
            return res.status(500).send('[!] ERROR to close the session');
        }
        res.clearCookie('connect.sid');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.redirect('/login.html');
    });
});

// logins view
router.get('/login.html', noCache, (req, res) => {
    if (req.session.username) {
        return res.redirect(req.session.username.role === 'admin' ? '/menu.html' : '/cajero.html');
    }
    res.sendFile('login.html', { root: path.join(__dirname, '../public') });
});

// safety logins
router.get('/gestion-productos.html', sesiones.isAuthenticated, sesiones.isAdmin, noCache, (req, res) => {
    res.sendFile('gestion-productos.html', { root: path.join(__dirname, '../public') });
});

router.get('/menu.html', sesiones.isAuthenticated, noCache, (req, res) => {
    res.sendFile('menu.html', { root: path.join(__dirname, '../public') });
});

module.exports = router;
