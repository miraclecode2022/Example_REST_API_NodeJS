const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const productModel = require('../models/product_model')
const multer = require("multer")
const os = require("os");
const storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null, './uploads/');
    },
    filename: function(req,file,cb){
        cb(null, new Date().getTime() + "-" + file.originalname);
    }
})

const fileFilter = (req,file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg'){
        cb(null, true);
    } else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage, 
    limits : {
    fileSize : 1024 * 1024 * 5
    },
    fileFilter : fileFilter
})

// Get all Product
router.get('/', (req,res,next) =>{
    productModel.find()
    .then(product => {
        res.json({
            count : product.length,
            products : product
            
        })
    })
    .catch(err =>{
        console.log(err);
    })
})
// Get one product with params productId
router.get('/:productId', (req,res,next) => {
    let productId = req.params.productId
    productModel.findOne({_id:productId})
    .exec()
    .then(product => {
        if(product){
            res.json({
                product
            }) 
        } else {
            res.json({
                message: "Can not find this id product"
            }) 
        }
        
    })
    .catch(err => {
        console.log(err);
    })
})

// Tạo mới product 
router.post('/create',upload.single('image') , (req,res,next) =>{
    let name = req.body.name
    let price = req.body.price
    let desc = req.body.desc
    let type = req.body.type
    let image = req.file.path
    let inCard = req.body.inCard
    let count = req.body.count
    let total = req.body.total
    const fullUrl = req.protocol + '://' + req.get('host');
    const NewProduct = new productModel({
        _id: new mongoose.Types.ObjectId(),
        name,
        price,
        desc,
        type,
        image: fullUrl+"\\"+image,
        inCard,
        count,
        total
    });
    NewProduct.save()
    .then(product => {
        res.json({
            product
        })
    })
})

// Update Product
router.patch('/:productId',verifyToken, (req,res,next) => {
    const id = req.params.productId;
    const input = req.body;
    for (const key of Object.keys(input)){

    }
    productModel.updateOne({_id : id}, {$set : input})
    .exec()
    .then(result => {
        res.json({
            msg : "Update done"
        })
    })
    .catch(err =>{
        console.log(err);
    })
})

// Xóa product
router.delete('/:productId',verifyToken, (req,res,next) => {
    const id = req.params.productId;
    productModel.remove({_id : id})
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