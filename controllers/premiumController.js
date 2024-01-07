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
        // const stringifiedExpenses = JSON.stringify(expenses)
        const htmlContent = generateHtmlTable(expenses)
        const filename = `expense${userId}/${new Date()}.html`
        const fileUrl = await S3Service.uploadToS3(htmlContent, filename)
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

function generateHtmlTable(expenses) {
    const headerRow = '<tr style="background-color: #f2f2f2;"><th style="border: 1px solid #dddddd; padding: 8px;">Date</th><th style="border: 1px solid #dddddd; padding: 8px;">Category</th><th style="border: 1px solid #dddddd; padding: 8px;">Amount</th><th style="border: 1px solid #dddddd; padding: 8px;">Description</th></tr>';
    
    // The map function transforms each expense object into an HTML table row
    const bodyRows = expenses.map(expense =>
        `<tr style="border: 1px solid #dddddd;"><td style="border: 1px solid #dddddd; padding: 8px;">${formatDate(expense.createdAt)}</td><td style="border: 1px solid #dddddd; padding: 8px;">${expense.category}</td><td style="border: 1px solid #dddddd; padding: 8px;">${expense.amount}</td><td style="border: 1px solid #dddddd; padding: 8px;">${expense.title || ''}</td></tr>`
    );

    // Join the array of HTML table rows into a single string
    return `<table style="border-collapse: collapse; width: 100%;">${headerRow}${bodyRows.join('')}</table>`;
}


function formatDate(date) {
    const formattedDate = new Date(date).toISOString().split('T')[0];
    return formattedDate;
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