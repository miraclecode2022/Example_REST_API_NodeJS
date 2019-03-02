require('dotenv').config()
const express = require('express')
const app = express()
const productRouter = require('./api/routes/product')
const userRouter = require('./api/routes/user')


app.use('/uploads', express.static('uploads'))
// format data to json
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ 
    extended : true
}))
app.use(bodyParser.json())

// Xác thực đường dẫn cho api khi requset
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header(
        'Access-Control-Allow-Headers' , 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    )
    if (req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
        return res.status(200).json({})
    }
    next()
})

app.use('/products', productRouter)
app.use('/users', userRouter)


// Tạo message khi api lỗi
app.use((req, res, next) => {
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})
app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    })
})

// import mongoose and connect to mongoDB
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true)
mongoose.connect("mongodb+srv://gialong98:"+process.env.PASS_DB+"@gl-cluster-aesdd.mongodb.net/test?retryWrites=true",{useNewUrlParser: true}, (err) => {
    if(err){
        console.log("Can't connect to database");
    }else{
        console.log("Connected");
    }    
})

module.exports = app