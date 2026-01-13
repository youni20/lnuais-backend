require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    dialect: 'postgres', // Prompt said 'postgresql' but sequelize uses 'postgres' usually. Prompt code said 'dialect: postgresql'. I will stick to 'postgres' which is correct for Sequelize, or try what prompt asked if it fails. 'postgres' is the standard dialect name in Sequelize.
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection successful');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    });
