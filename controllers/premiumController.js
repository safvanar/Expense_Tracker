const bodyParser = require('body-parser')
const User = require('../models/users')
const Expense = require('../models/expenseModel')
const sequelize = require('../utils/database')
const DBService = require('../services/dbservice') 
const S3Service = require('../services/s3service')


exports.getLeaderBoard = async (req, res, next) => {
    try{
        const users = await User.findAll({attributes: ['name', 'totalSpending'], order: [['totalSpending', 'DESC']]})
        res.status(201).json({users: users, message: 'succesful!'})
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'Error fetching leader board!'})
    }
}

exports.getReport = async (req, res, next) => {
    try{
        const expenses = await DBService.getExpenses(req)
        const userId = req.user.id
        // console.log(expenses)
        const stringifiedExpenses = JSON.stringify(expenses)
        const filename = `expense${userId}/${new Date()}.txt`
        const fileUrl = await S3Service.uploadToS3(stringifiedExpenses, filename)
        await req.user.createDownloadedFile({fileUrl: fileUrl})
        console.log(fileUrl)
        return res.status(200).json({fileUrl: fileUrl, success: true})
    }catch(err){
        console.log(err)
        return res.status(500).json({fileUrl: '', success: false})
    }
}


exports.getDownloadedFiles = async (req, res, next) => {
    try{
        const downloadedFiles = await req.user.getDownloadedFiles()
        return res.status(201).json({downloadedFiles: downloadedFiles, success: true})
    }catch(err){
        console.log(err)
        return res.status(500).json({downloadedFiles: '', success: false})
    }
}


// exports.getLeaderBoard = async (req, res, next) => {
//     try{
//         const leaderBoard = await User.findAll({
//             attributes: ['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.amount')), 'totalSpending']],
//             include: [{
//                 model: Expense,
//                 attributes: []
//             }],
//             group: ['user.id'],
//             order: [['totalSpending', 'DESC']]
//     })
//     res.status(201).json(leaderBoard) 
//     }catch(err){
//         console.log(err)
//         res.status(403).json({message: 'Error fetching leader board!'})
//     }
// }