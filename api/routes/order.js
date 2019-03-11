const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const productModel = require('../models/product_model')
const orderModel = require('../models/order_model')



// Get all Oder
router.get('/', (req,res,next) => {
    orderModel.find()
    .exec()
    .then(orders => {
        console.log(orders);
        res.status(200).json({
            count : orders.length,
            orders
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        })
    })
})

// Get Oder by id
router.get('/:orderId', (req,res,next) => {
    orderModel.findById(req.params.orderId)
    .exec()
    .then(orders => {
        res.status(200).json({
            orders,
            customer : orders.customer,
            products : orders.products
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        })
    })
})


// tạo mới order
router.post('/create', (req,res,next) =>{
    const order = new orderModel({
        _id : mongoose.Types.ObjectId(),
        customer : req.body.customer,
        products : req.body.products
    })
    order.save()
    .then(result => {
        console.log(result);
        res.status(201).json({
            status: true,
            message : "Ordered Successful",
            url : "localhost:8080/order/" + result._id
            })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error : err
        })
    })
})

// Xóa order by Id
router.delete('/:orderId',verifyToken, (req,res,next) => {
    const id = req.params.orderId;
    orderModel.remove({_id : id})
    .exec()
    .then(result => {
        res.json({
            msg : "Delete" 
        })
    })
    .catch(err => {
        console.log(err)
    })
})

// API crate token request Form
router.get('/token/rest', (req, res, next) => {
    jwt.sign({
        data: 'coffeecode'
    }, 'coffeecode', { expiresIn: "60" }, (err, data) => {
        res.json({
            token: data
        })
    });
})

function verifyToken (req, res, next) {
    const bearerHeader = req.headers['authorization']
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]
        req.token = bearerToken
        jwt.verify(req.token, process.env.SECRET_KEY, function(err, data) {
            if(data){
                next()
            } else {
                res.status(403).json({
                    message: 'Authorization was expire'
                })
            }
        })
    }
    else{
        res.status(403).json({
            message: 'Authorization cannot be empty'
        })
    }
}

module.exports = router;