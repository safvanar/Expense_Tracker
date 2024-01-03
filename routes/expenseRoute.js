const express = require('express')

const expenseController = require('../controllers/expenseController')

const userAuthentication = require('../middlewares/auth')

const router = express.Router()

// router.get('/expenses', expenseController.getExpenses)
router.post('/add-expense', userAuthentication, expenseController.postAddExpense)

router.delete('/delete-expense/:expenseId', userAuthentication, expenseController.deleteExpense)

router.put('/edit-expense', userAuthentication, expenseController.getEditExpense)

router.get('/get-expenses', userAuthentication, expenseController.getExpenses)

router.get('/get-expense/:expId', userAuthentication, expenseController.getExpense)

module.exports = router