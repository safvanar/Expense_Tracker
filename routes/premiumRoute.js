const express = require('express')

const premiumController = require('../controllers/premiumController')

const userAuthentication = require('../middlewares/auth')

const router = express.Router()

// router.get('/expenses', expenseController.getExpenses)
router.get('/showLeaderBoard', userAuthentication, premiumController.getLeaderBoard)
router.get('/get-report', userAuthentication, premiumController.getReport)
router.get('/getDownloadedFiles', userAuthentication, premiumController.getDownloadedFiles)

module.exports = router