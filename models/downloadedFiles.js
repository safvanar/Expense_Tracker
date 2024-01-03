const Sequelize = require('sequelize')

const sequelize = require('../utils/database')

const DownloadedFile = sequelize.define('downloadedFile', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

module.exports = DownloadedFile