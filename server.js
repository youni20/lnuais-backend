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
const compatibilityMiddleware = require('./src/middleware/compatibility');
app.use(compatibilityMiddleware);

const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('./src/config/passport');
const { sequelize } = require('./src/config/database');

// Session configuration
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, // Construct connection string explicitly
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET || 'lnuais2025supersecretkeyforsessionstorage', // Fallback for dev
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: [
        'https://prod.dhplo653bqz9b.amplifyapp.com',
        'http://localhost:3000',
        'http://127.0.0.1:5500'
    ],
    credentials: true
}));

const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');

// Routes
app.use('/api/auth', authRoutes);
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
