const Sequelize = require('sequelize')

const sequelize = require('../utils/database')

const ForgotPasswordRequest = sequelize.define('forgotPasswordRequest', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    isActive: Sequelize.BOOLEAN
})

module.exports = ForgotPasswordRequest