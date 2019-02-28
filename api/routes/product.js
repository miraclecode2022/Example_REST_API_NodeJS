const express = require('express')
const router = express.Router()
const productModel = require('../models/product_model')

// Get all Product
router.get('/', (req,res,next) =>{
    productModel.find()
    .then(product => {
        res.json({
            count : product.length,
            product : product
            
        })
    })
    .catch(err =>{
        console.log(err);
    })
})
// Get one product with params price
router.get('/:price', (req,res,next) => {
    let price = req.params.price
    productModel.findOne({price:price})
    .exec()
    .then(price => {
        res.json({
            price : price
        })
    })
    .catch(err => {
        console.log(err);
    })
})

// Tạo mới product 
router.post('/create',verifyToken, (req,res,next) =>{
    let name = req.body.name
    let price = req.body.price
    let desc = req.body.desc
    let type = req.body.type
    let image = req.body.image
    let inCard = req.body.inCard
    let count = req.body.count
    let total = req.body.total
    const NewProduct = new productModel({
        name,
        price,
        desc,
        type,
        image,
        inCard,
        count,
        total
    });
    NewProduct.save()
    .then(product => {
        res.json({
            msg : true
        })
    })
})

// Update Product
router.patch('/:productId',verifyToken, (req,res,next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propsName] = ops.value;
    }
    productModel.update({_id : id}, {$set : updateOps})
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
        next()
    }
    else{
        res.status(403).json({
            message: 'Authorization cannot be empty'
        })
    }
}
module.exports = router;