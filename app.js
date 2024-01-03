require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const cors = require('cors');

const sequelize = require('./utils/database')

const app = express();

const expenseRoutes = require('./routes/expenseRoute');

const userRoutes = require('./routes/userRoute')

const purchaseRoutes = require('./routes/purchaseRoute')

const premiumRoutes = require('./routes/premiumRoute')

const passwordRoutes = require('./routes/passwordRoute')

const User = require('./models/users')

const Expense = require('./models/expenseModel')

const Order = require('./models/orders');

const ForgotPasswordRequest = require('./models/forgotPasswordRequests');

const DownloadedFile = require('./models/downloadedFiles')

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))

app.use(cors());

app.use(bodyParser.json({ extended: false }));

app.use('/user', userRoutes)

app.use('/premium', premiumRoutes)

app.use('/expense', expenseRoutes);

app.use('/purchase', purchaseRoutes)

app.use('/password', passwordRoutes)

app.use('/home', (req, res, next) => {
    res.sendFile('index.html', {root:'views'})
})

app.use('/signup', (req, res, next) => {
    res.sendFile('signup.html', {root:'views'})
})

app.use((req, res, next) => {
    res.sendFile('login.html', {root:'views'})
})

User.hasMany(Expense, { onDelete: 'CASCADE', hooks: true })
Expense.belongsTo(User)

User.hasMany(Order, { onDelete: 'CASCADE', hooks: true })
Order.belongsTo(User)

User.hasMany(ForgotPasswordRequest, { onDelete: 'CASCADE', hooks: true })
ForgotPasswordRequest.belongsTo(User)

User.hasMany(DownloadedFile, { onDelete: 'CASCADE', hooks: true })
DownloadedFile.belongsTo(User)

const PORT = process.env.PORT

async function initiate(){
    try {
        await sequelize.sync()
            app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

initiate()
