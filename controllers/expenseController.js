const bodyParser = require('body-parser')

const Expense = require('../models/expenseModel')

const sequelize = require('../utils/database')

const User = require('../models/users')

exports.postAddExpense = async (req, res, next) => {
    const t = await sequelize.transaction()
    try{
        const user = req.user
        const amount = req.body.expenseAmount
        const title = req.body.expenseTitle
        const category = req.body.expenseCategory

        if(amount == undefined || amount.length === 0 || title == undefined || title.length ===0){
            return res.status(400).json({message: 'Bad parameters'})
        }

        const promise1 = user.createExpense({
                                    title: title,
                                    amount: amount,
                                    category: category,
                                }, {transaction: t})
        const promise2 = user.update({totalSpending: parseInt(user.totalSpending) + parseInt(amount)}, {transaction: t})

        //improved code using Promise.all()
        Promise.all([promise1, promise2])
        .then(async () => {
            await t.commit()
            res.status(201).redirect('/home')
        })
        .catch(async (err) => {
            await t.rollback()
            throw new Error(err)
        })

        //This code would have slow down since we were using await for parallel transactions
        // await user.createExpense({
        //     title: title,
        //     amount: amount,
        //     category: category,
        // }, {transaction: t})
        // await user.update({totalSpending: parseInt(user.totalSpending) + parseInt(amount)}, {transaction: t})
        // await t.commit()
        // res.status(201).redirect('/home')
    }catch(err){
        await t.rollback()
        res.status(500).json({message: 'server side error'})
    }
}

exports.getExpenses = async (req, res, next) => {
    try{
        const page = parseInt(req.query.page) || 1
        const pageSize = parseInt(req.query.pageSize) || 5
        const offset = (page - 1) * pageSize
        const expenses = await req.user.getExpenses({
            limit: pageSize,
            offset: offset
        }) // -> using magic functions due to the association
        // const expenses = await Expense.findAll({where: { userId: req.user.id}})
        res.status(200).json({ expenses: expenses})
    }catch(err){
        console.log(err)
    }
}

exports.getEditExpense = async (req, res, next) => {
    const t = await sequelize.transaction()
    try{
        const user = req.user
        const expId = req.body.expId
        const amount = req.body.expenseAmount
        const title = req.body.expenseTitle
        const category = req.body.expenseCategory 

        // console.log("Changes: "+ amount)

        const expense = await Expense.findByPk(expId)
        if(expense.userId === user.id){
            const expenseOld = expense.amount
            const promise1 = expense.update({amount: amount, title: title, category: category}, {transaction: t})
            const promise2 = user.update({totalSpending: parseInt(user.totalSpending) - parseInt(expenseOld) + parseInt(amount)}, {transaction: t})
            Promise.all([promise1, promise2])
            .then(async () => {
                await t.commit() 
                res.redirect('/get-expenses')
            })
            .catch(async (err) => {
                await t.rollback()
                throw new Error(err)
            })
        }else{
            throw new Error('User is not authenticated to edit the expense')
        }
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'Could not edit the expense!'})
    }
    

    // Expense.findByPk(expId)
    //     .then(expense => {
    //         expense.amount = amount
    //         expense.title = title
    //         expense.category = category
    //         if(expense.userId === user.id){
    //             return expense.save()
    //         }else{
    //             throw new Error('User is not authenticated to edit the expense')
    //         }
    //     })
    //     .then(result => {
    //         res.redirect('/get-expenses')
    //     })
    //     .catch(err => {
    //         console.log(err)
    //     })
}

exports.deleteExpense = async (req, res, next) => {
    const t = await sequelize.transaction()
    try{
        const user = req.user
        const expId = req.params.expenseId
        console.log("Expense ID: ", expId)

        //Expense.destroy({where: {id: expId, userId: user.id}})
        const expense = await Expense.findByPk(expId)
        const expenseAmount = expense.amount
        // console.log(`${user.totalSpending} - ${expenseAmount} = ${user.totalSpending - expenseAmount}`)

        const promise1 = user.update({totalSpending: parseInt(user.totalSpending) - parseInt(expenseAmount)}, {transaction: t})
        const promise2 = expense.destroy({transaction: t})

        Promise.all([promise1, promise2])
        .then(async () => {
            await t.commit()
            res.redirect('/home')
        })
        .catch(async (err) => {
            await t.rollback()
            throw new Error(err)
        })
    }catch(err){
        await t.rollback()
        console.log(err)
        res.status(403).json({message: 'user is not authorized for deleting other\'s expenses'})
    }
}

exports.getExpense = async (req, res, next) => {
    try{
        const user = req.user
        const expId = req.params.expId
        const expense = await Expense.findByPk(expId)
        if(expense.userId === user.id){
            res.status(200).json({message: 'successful', expense: expense})
        }else{
            throw new Error('User is not authenticated to view')
        }
    }catch(err){
        console.log(err)
        res.status(500).json({message: 'error fetching the expense'})
    }
}