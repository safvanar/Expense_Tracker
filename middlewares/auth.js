const jwt = require('jsonwebtoken')
const User = require('../models/users')

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')
        // console.log(token)
        const userObj = jwt.verify(token, 'secret-key')
        const user = await User.findByPk(userObj.userId)
        req.user = user
        // console.log('User >>>>>>> ', req.user)
        next()
    }catch(err){
        console.log(err)
        return res.status(401).json({success: false})
    }
} 

module.exports = authenticate