const bodyParser = require('body-parser')
const User = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

function isStringEmpty(string){
    if(string == undefined || string.length === 0){
        return true
    }else{
        return false
    }
}

function generateAccessToken(id, isPremiumUser){
    return jwt.sign({userId: id, isPremiumUser: isPremiumUser}, 'secret-key')
}

exports.checkUser = async (req, res, next) => {
    try{
        const email = req.body.email
        const password = req.body.password
        
        const user = await User.findOne({where: {email: email}})
        if(user){
            if(bcrypt.compareSync(password, user.password)){
                const token = generateAccessToken(user.id, user.isPremiumUser) //jwt.sign({userId: user.id, isPremiumUser: user.isPremiumUser}, 'secret-key')
                res.status(200).json({login: 'success', token: token})
            }else{
                throw new Error('Authentication failure')
            }  
        }
        else{
            res.status(401).json({message: 'username and/or password is incorrect!'})
        }
    }catch(err){
        res.status(401).json({message: 'username and/or password is incorrect!'})
    }
    
}

exports.createUser = async (req, res, next) => {
    try{
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        
        const hashedPassword = bcrypt.hashSync(password, 10)

        if(isStringEmpty(name) || isStringEmpty(email) || isStringEmpty(password)){
            return res.status(400).json({message: 'Fill in all fields!'})
        }
        const user = await User.create({
            name: name,
            email: email,
            password: hashedPassword,
            isPremiumUser: false
        })
        res.status(201).json({message: 'account created successfully!'})
    }catch(err){
        res.status(500).json({message: 'error creating an account!'})
    }
}

exports.getUserStatus = async (req, res, next) => {
    try{
       const userStatus = req.user.isPremiumUser
       res.status(201).json({isPremiumUser: userStatus})
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'Error fetching user status!'})
    }
}

exports.getTotal = async (req, res, next) => {
    try{
        const total = req.user.totalSpending
        res.status(201).json({total: total, success: true})
    }catch(err){
        res.status(403).json({message: 'Error fetching total!', success: false})
    }
}