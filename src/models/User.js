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
        allowNull: false,
        comment: 'Study programme of the user'
    },
    experience_level: {
        type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
        allowNull: false,
        comment: 'User experience level'
    }
}, {
    tableName: 'users',
    timestamps: true, // created_at, updated_at
    underscored: true // Use snake_case for DB columns (created_at)
});

module.exports = User;
