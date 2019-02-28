require('dotenv').config()
const express = require('express')
const app = express()
const productRouter = require('./api/routes/product')
const userRouter = require('./api/routes/user')

// format data to json
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ 
    extended : true
}))
app.use(bodyParser.json())


app.use('/product', productRouter)
app.use('/users', userRouter)



// import mongoose and connect to mongoDB
const mongoose = require('mongoose')
mongoose.connect("mongodb+srv://gialong98:"+process.env.PASS_DB+"@gl-cluster-aesdd.mongodb.net/test?retryWrites=true",{useNewUrlParser: true}, (err) => {
    if(err){
        console.log("Can't connect to database");
    }else{
        console.log("Connected");
    }    
})

module.exports = app