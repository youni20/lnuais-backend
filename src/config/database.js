const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: console.log, // Log SQL queries to console
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Needed for AWS RDS in some configs, verification mentions common issues
            }
        }
    }
);

module.exports = sequelize;
