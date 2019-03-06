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
    .then(order => {
        console.log(order);
        res.status(200).json({
            count : order.length,
            order
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
    .then(order => {
        console.log(order);
        res.status(200).json({
            message : "Found It",
            type : "GET BY ID",
            Url : "localhost:8080/order/" + order._id,
            Body : {
                quantity : order.quantity,
                productId : order.product
            }
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
        orders : req.body.orders
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