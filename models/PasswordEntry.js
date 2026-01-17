const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const PasswordEntry = sequelize.define('PasswordEntry', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    encryptedData: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    iv: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
        },
    ],
});

User.hasMany(PasswordEntry, { foreignKey: 'userId', onDelete: 'CASCADE' });
PasswordEntry.belongsTo(User, { foreignKey: 'userId' });

module.exports = PasswordEntry;
