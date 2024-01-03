const Razorpay = require('razorpay')
const Order = require('../models/orders')
const User = require('../models/users')
const jwt = require('jsonwebtoken')


function generateAccessToken(id, isPremiumUser){
    return jwt.sign({userId: id, isPremiumUser: isPremiumUser}, 'secret-key')
}

exports.getPremiumMembership = async (req, res, next) => {
    try{
        // const key_id = process.env.RAZORPAY_KEY_ID
        // console.log("UserId >>>>>>>>> ", req.user.id)
        // console.log("KeyId >>>>>>>> ", key_id)
        var rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })
        const amount = 2500
        rzp.orders.create({amount, currency: "INR"}, async (err, order) => {
            if(err){
                throw new Error(JSON.stringify(err))
            }
            
            await req.user.createOrder({orderId: order.id, status: 'PENDING'})
            res.status(201).json({order, key_id: rzp.key_id})
        })
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'something went wrong', error: err})
    }
}

exports.updateTransactionStatus = async (req, res, next) => {
    try{
        const user = req.user
        const paymentId = req.body.payment_id
        const orderId = req.body.order_id
        const order = await Order.findOne({where: {orderId: orderId}})
        // console.log('PAYMENT ID: ', paymentId)
        const promise1 = order.update({paymentId: paymentId, status: 'COMPLETED'})
        const promise2 = req.user.update({isPremiumUser: true})

        //Time taking:
        // await order.update({paymentId: paymentId, status: 'COMPLETED'})
        // await req.user.update({isPremiumUser: true})

        Promise.all([promise1, promise2])
        .then(() => {
            const token = generateAccessToken(user.id, user.isPremiumUser)
            return res.status(201).json({message: 'payment successful!', token: token})
        })
        .catch((err) => {
            throw new Error(err)
        })
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'updating transaction failed!', error: err})
    }
}

exports.updateFailedTransactionStatus = async (req, res, next) => {
    try{
        const paymentId = req.body.payment_id
        const orderId = req.body.order_id
        const order = await req.user.getOrders({where: {orderId: orderId}})
        console.log('PAYMENT ID: ', paymentId)
        order[0].paymentId = 'N/A'
        order[0].status ='FAILED'
        await order[0].save()
        res.status(201).json({message: 'payment failed!'})
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'updating transaction failed!', error: err})
    }
}