const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const sequelize = require('./src/config/database');
require('dotenv').config();
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.enable('trust proxy'); // essential for properly handling X-Forwarded-Proto behind CloudFront/Amplify

// Middleware
app.use(cors({
    origin: [
        'https://prod.dy1i4sfv0u39q.amplifyapp.com', // Old one
        'https://prod.d2pwipsvk7jchw.amplifyapp.com', // Your Amplify domain
        'https://lnuais.com',                        // New Custom Domain
        'https://www.lnuais.com',                    // New Custom Domain (www)
        'https://prod.dhplo653bqz9b.amplifyapp.com',
        'https://dgzvl0b4x5nn2.cloudfront.net',      // CloudFront domain
        'http://localhost:3000',
        'http://127.0.0.1:5500',
        'http://localhost:5000'
    ],
    credentials: true
}));

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
            ssl: (process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1') ? false : {
                require: true,
                rejectUnauthorized: false
            } // Enable SSL for RDS connection, disable for local
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
        secure: false, // process.env.NODE_ENV === 'production',
        sameSite: 'lax' // Back to lax since we are now proxied as "Same Domain"
    }
}));

app.use(passport.initialize());
app.use(passport.session());

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
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Not Set (Using Fallback)');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

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
