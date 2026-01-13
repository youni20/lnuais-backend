const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Welcome to LNU AIS!',
        text: `Hi ${userName},\n\nWelcome to LNU AIS! We are excited to have you on board.\n\nBest regards,\nThe LNU AIS Team`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Welcome email sent to ${userEmail}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = { sendWelcomeEmail };
