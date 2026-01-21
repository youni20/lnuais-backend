const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

// Email/Password Authentication
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Google OAuth
// Google OAuth
router.get('/google', (req, res, next) => {
    // Dynamic Callback URL for multiple domains (Amplify + Custom Domain)
    const host = req.headers.host;
    let callbackOrigin = 'https://prod.d2pwipsvk7jchw.amplifyapp.com'; // Default fallback

    // Trust the host header if it matches our known domains
    if (host && (host.includes('lnuais.com') || host.includes('amplifyapp.com'))) {
        callbackOrigin = `https://${host}`;
    }

    const callbackURL = `${callbackOrigin}/api/auth/google/callback`;

    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        callbackURL: callbackURL
    })(req, res, next);
});

router.get('/google/callback',
    (req, res, next) => {
        const host = req.headers.host;
        let callbackOrigin = 'https://prod.d2pwipsvk7jchw.amplifyapp.com';

        if (host && (host.includes('lnuais.com') || host.includes('amplifyapp.com'))) {
            callbackOrigin = `https://${host}`;
        }

        const callbackURL = `${callbackOrigin}/api/auth/google/callback`;

        passport.authenticate('google', {
            failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin.html?error=auth_failed`,
            callbackURL: callbackURL
        })(req, res, next);
    },
    (req, res) => {
        // Use the environment variable for the frontend URL, fallback to localhost only if not set
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Check if profile is complete
        if (!req.user.programme || !req.user.experience_level) {
            // Append query param to trigger edit mode on dashboard
            return res.redirect(`${frontendUrl}/dashboard.html?action=complete_profile`);
        }
        res.redirect(`${frontendUrl}/dashboard.html`);
    }
);

// Session Management
router.get('/logout', authController.logout);
router.get('/current-user', authController.getCurrentUser);

module.exports = router;
