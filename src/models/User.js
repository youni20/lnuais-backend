const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User Model
 * Represents a registered user in the system.
 */
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Unique identifier for the user'
    },
    full_name: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Full name of the user'
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        },
        comment: 'Email address (must be unique)'
    },
    programme: {
        type: DataTypes.TEXT,
        allowNull: true, // Changed to true as OAuth might create user without it initially
        comment: 'Study programme of the user'
    },
    experience_level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        allowNull: true, // Changed to true as OAuth might create user without it initially
        comment: 'User experience level'
    },
    // Auth Fields
    verification_code: {
        type: DataTypes.STRING(6),
        allowNull: true
    },
    verification_code_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Assuming new users are enabled by default
        allowNull: false
    },
    reset_password_token: {
        type: DataTypes.STRING(6),
        allowNull: true
    },
    reset_password_expires: {
        type: DataTypes.DATE,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Hashed password for email/password login'
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        comment: 'Google OAuth user ID'
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true
});

module.exports = User;
