const uuid = require('uuid')
const bcrypt = require('bcrypt')

const User = require('../models/users')
const ForgotPasswordRequest = require('../models/forgotPasswordRequests')
const sequelize = require('../utils/database')

const Sib = require('sib-api-v3-sdk')
const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.MAIL_API_KEY
const tranEmailApi = new Sib.TransactionalEmailsApi()
const sender ={
    email: 'safvanforfkart@gmail.com',
    name: 'Expense Tracker Pro'
}

function isStringEmpty(string){
    if(string == undefined || string.length === 0){
        return true
    }else{
        return false
    }
}

exports.postResetPasswordReq = async (req, res, next) => {
    try{
        const resetEmail = req.body.resetEmail
        const receiver = [{email: resetEmail}]
        const user = await User.findOne({where: {email: resetEmail}})
        if(user){
            const randomUUID = uuid.v4()
            await user.createForgotPasswordRequest({id: randomUUID, isActive: true})
            await tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Password reset',
                htmlContent: `<p>Hello ${user.name},<br>
                            You are receiving this mail as per your request to change your password for your expense tracker pro account.
                            You can change your password from here:<br>
                            <a href='http://3.110.88.179/password/resetPassword/${randomUUID}'>reset password</a></p>`
            })
            return res.status(201).json({message: 'succesful!'})
        }else{
            throw new Error("User doesn't exist!")
        }
    }catch(err){
        console.log(err)
        return res.status(403).json({message: 'Error sending email!'})
    }
}

exports.getResetPassword = async (req, res, next) => {
    try{
        const forgotPassId = req.params.forgotPassId
        const forgotReq = await ForgotPasswordRequest.findOne({where: {id: forgotPassId}})
        console.log(forgotPassId, forgotReq.isActive)
        if(forgotReq.isActive){
            res.send(`<!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css"
                    integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
                <title>Expense Tracker</title>
            </head>
            
            <body>
                <header id="main-header" class="bg-success text-white p-4 mb-3">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-6">
                                <h1 id="header-title">Expense Tracker</h1>
                            </div>
                        </div>
                    </div>
                </header>
                <div class="container">
                    <div id="main" class="card card-body">
                        <h2 class="title">Password Reset</h2>
                        <form id="passwordResetForm" action="/password/changePassword/${forgotPassId}" method="POST" class="mb-3">
                            <label for="email">Email:</label>
                            <input type="email" class="form-control mr-2" id="email" name="email" placeholder="Enter your email...">
                            <label for="newPassword">New Password:</label>
                            <input type="password" class="form-control mr-2" id="newPassword" name="newPassword" placeholder="Enter new password...">
                            <button type="submit" id="resetPasswordBtn" class="btn btn-md btn-primary mt-2">Reset Password</button>
                        </form>
                        Forgot password? <a class="btn btn-sm btn-warning" style="width: 3rem;" id="resetBtn">Reset</a>
                        New to here?<a href="/signup" style="color: red; text-decoration: none;">Create an account now</a> 
                        <div style="color: red;" id="response-message"></div>
                    </div>
                </div>
            
                
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
                
            </body>
            
            </html>`)
            res.end()
            // return res.status(200).sendFile('resetPassword.html', {root: 'views'})
        }else{
            throw new Error('Invalid link to reset password!')
        }
    }catch(err){
        console.log(err)
        return res.status(403).json({message: 'Error resetting the password!'})
    }
}

exports.postChangePassword = async (req, res, next) => {
    const t = await sequelize.transaction()
    try{
        console.log(req)
        const forgotPassId = req.params.forgotPassId
        const email = req.body.email
        const newPassword = req.body.newPassword
        console.log("DATA: ", newPassword)
        if(isStringEmpty(email) || isStringEmpty(newPassword)){
            return res.status(400).json({message: 'Fill in all fields!'})
        }

        const forgotReq = await ForgotPasswordRequest.findOne({where: {id: forgotPassId}})
        const user = await User.findOne({where: {id: forgotReq.userId}})
        if(user){
            const hashedPassword = bcrypt.hashSync(newPassword, 10)
            const promise1 = user.update({password: hashedPassword}, {transaction: t})
            const promise2 = ForgotPasswordRequest.update({isActive: false},{where: {userId: user.id}}, {transaction: t})

            Promise.all([promise1, promise2])
            .then(async () => {
                await t.commit()
                return res.status(201).sendFile('resetPassword.html', {root: 'views'})
                // return res.status(201).json({message: 'password changed succesfully!', success: true})
            })
            .catch(async (err) => {
                console.log(err)
                await t.rollback()
                throw new Error('Error changing password!')
            })
        }else{
            throw new Error("User doesn't exist!")
        }
    }catch(err){
        console.log(err)
        res.status(403).json({message: 'Could not change the user password!'})
    }
    
}

//Rundan's code

// const User = require('../models/users')
// const Sib = require('sib-api-v3-sdk');

// const tranEmailApi = new Sib.TransactionalEmailsApi();

// // Set the Sendinblue API key during the application initialization
// const client = Sib.ApiClient.instance;
// const apiKey = client.authentications['api-key'];
// apiKey.apiKey = process.env.SMTP_API_KEY;



// exports.resetPassword = async (req, res) => {
//     const { resetEmail } = req.body;

//     try {
//         const user = await User.findOne({ where: { email: resetEmail } });
//         if (user) {
//             console.log(user)
//             // const randomUUID = uuidv4();

//             // await user.createForgotPassword({ id: randomUUID, active: true })
//             //     .catch((err) => {
//             //         throw new Error(err);
//             //     })

//             const sender = {
//                 email: 'safvanforfkart@gmail.com',
//                 name: 'Safvan A R'
//             };

//             const receivers = [
//                 {
//                     email: user.email,
//                 },
//             ];

//             // const resetLink = http://localhost:3000/password/reset-password/${randomUUID}

//             tranEmailApi.sendTransacEmail({
//                 sender,
//                 to: receivers,
//                 subject: 'Reset the password',
//                 textContent: 'Visit the link to reset password'
//                 // htmlContent: `<p>Visit the following link to reset your password:</p>
//                 //               <a href="${resetLink}">click here to reset password</a>`
//             })
//                 .then((response) => {
//                     console.log(response);
//                     res.status(200).json({ message: 'Password reset email sent successfully' });
//                 })
//                 .catch((error) => {
//                     throw new Error('Internal server error')
//                 });
//         }
//         else {
//             res.status(404).json({ message: 'User not found with this email' });
//         }
//     }
//     catch (err) {
//         res.status(500).json(err.message);
//     }

// };