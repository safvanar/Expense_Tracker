const Sequelize = require('sequelize')

const sequelize = require('../utils/database')

const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amount: {
        type: Sequelize.DOUBLE,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = Expense