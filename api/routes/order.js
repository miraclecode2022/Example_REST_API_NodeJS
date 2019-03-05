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
    .then(result => {
        console.log(result);
        res.status(200).json(result);
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
    .then(result => {
        console.log(result);
        res.status(200).json({
            message : "Found It",
            type : "GET BY ID",
            Url : "localhost:8080/order/" + result._id,
            Body : {
                quantity : result.quantity,
                productId : result.product
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
router.post('/create',verifyToken, (req,res,next) =>{
    productModel.findById(req.body.productId)
    .then(product => {
        if(!product){
            return res.status(404).json({
                message : "Can't found this Product"
            })
        }
        const order = new orderModel({
            _id : mongoose.Types.ObjectId(),
            quantity : req.body.quantity,
            product : req.body.productId
        })
        return order.save()
    })
    .then(result => {
        console.log(result);
        res.status(201).json({
            type : "POST",
            message : "Order Stored",
            Url : "localhost:8080/order/create/" + result._id
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