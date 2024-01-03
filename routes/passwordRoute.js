const express = require('express')

const passwordController = require('../controllers/passwordController')

const router = express.Router()

// router.get('/expenses', expenseController.getExpenses)
router.post('/resetPasswordReq', passwordController.postResetPasswordReq)
router.get('/resetPassword/:forgotPassId', passwordController.getResetPassword)
router.post('/changePassword/:forgotPassId', passwordController.postChangePassword)

module.exports = router