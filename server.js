const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./src/config/database');
require('dotenv').config();
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cors({
    origin: [
        'https://prod.dhplo653bqz9b.amplifyapp.com',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ],
    credentials: true
}));

const userRoutes = require('./src/routes/userRoutes');

// Routes
app.use('/api/users', userRoutes);

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Error Handler
app.use(errorHandler);

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models (create tables)
        await sequelize.sync({ alter: true }); // Alter ensures schema updates without data loss during dev
        console.log('Database synchronized.');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();
