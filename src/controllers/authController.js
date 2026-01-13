const bcrypt = require('bcrypt');
const User = require('../models/User'); // Adjusted import, User exports directly
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/emailService');
const { Op } = require('sequelize');

exports.verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        if (user.verification_code !== code) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }

        if (new Date() > user.verification_code_expires) {
            return res.status(400).json({ error: 'Verification code expired. Please request a new one.' });
        }

        // Verify user
        user.is_verified = true;
        user.verification_code = null;
        user.verification_code_expires = null;
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(email, user.full_name);

        // Auto-login
        req.login(user, (err) => {
            if (err) {
                console.error('Auto-login error after verification:', err);
                // Even if login fails, verification succeeded, so tell them to login manually
                return res.json({ message: 'Email verified! Please log in.' });
            }
            res.json({
                message: 'Email verified successfully! Logging you in...',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    programme: user.programme,
                    experience_level: user.experience_level,
                    is_verified: true
                }
            });
        });

    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};

exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ error: 'Email already verified' });
        }

        // Generate new code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.verification_code = verificationCode;
        user.verification_code_expires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendVerificationEmail(email, user.full_name, verificationCode);

        res.json({ message: 'Verification code resent. Check your email.' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ error: 'Failed to resend verification code' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        // Compare password even if user not found to prevent timing attacks (mock)
        if (!user || !user.password) {
            // If using bcrypt, you might compare against dummy hash but here checking exists first
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.is_verified) {
            return res.status(403).json({
                error: 'Email not verified',
                message: 'Please verify your email before logging in',
                code: 'UNVERIFIED_ACCOUNT' // Added helpful code for frontend
            });
        }

        // Create session
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Login failed' });
            }

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    email: user.email,
                    programme: user.programme,
                    experience_level: user.experience_level
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ where: { email } });

        // Always return success (don't reveal if email exists)
        if (!user) {
            return res.json({ message: 'If that email exists, a reset code has been sent.' });
        }

        // Generate reset token
        const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

        user.reset_password_token = resetToken;
        user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save();

        await sendPasswordResetEmail(email, user.full_name, resetToken);

        res.json({ message: 'If that email exists, a reset code has been sent.' });
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Failed to process password reset request' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user || user.reset_password_token !== code) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        if (new Date() > user.reset_password_expires) {
            return res.status(400).json({ error: 'Reset code expired. Please request a new one.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        res.json({ message: 'Password reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        req.session.destroy();
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logged out successfully' });
    });
};

exports.getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    // Return flattened structure matching frontend expectations directly
    res.json({
        id: req.user.id,
        name: req.user.full_name,
        email: req.user.email,
        picture: req.user.picture || null, // Add if available
        program: req.user.programme,
        level: req.user.experience_level,
        is_verified: req.user.is_verified
    });
};
