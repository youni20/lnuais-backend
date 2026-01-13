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

// Session configuration
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
            ssl: {
                require: true,
                rejectUnauthorized: false
            } // Enable SSL for RDS connection
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

console.log('Environment check:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('PORT:', process.env.PORT);
console.log('MAIL_USERNAME:', process.env.MAIL_USERNAME);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set ✅' : 'Missing ❌');

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Sync models (create tables)
        // await sequelize.sync({ alter: true }); 
        await sequelize.sync(); // Try without alter first to verify connection/startup
        console.log('✅ Database synchronized');

        const server = app.listen(PORT, () => {
            console.log(`✅ Server running on port ${PORT}`);
        });

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
            } else {
                console.error('❌ Server error:', err);
            }
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

startServer();
