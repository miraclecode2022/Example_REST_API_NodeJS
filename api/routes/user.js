const express = require('express')
const UserModel = require('../models/users_model')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// Get All User on DB
router.get('/', (req, res, next)=>{
    UserModel.find()
    .exec()
    .then((user) => {
        res.json({
            count : user.length,
            user : user
        })
    })
    .catch(err => {
        console.log(err);
    })
})  

// Get one user with params name
router.get('/:name', (req,res,next) => {
    let name = req.params.name
    UserModel.findOne({name:name})
    .exec()
    .then(name => {
        res.json({
            name : name
        })
    })
    .catch(err => {
        console.log(err);
    })
})

// Tạo user
router.post('/register', (req,res,next) => {
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    let password2 = req.body.password2
    
    // Check Require fields
    if(!name | !email | !password | !password2){
        res.json({
            msg : false
        })
    }
    // Check password and password2 is match
    if(password !== password2){
        res.json({
            msg : false
        })
    }
    // Check length password
    if(password.length < 6){
        res.json({
            msg : false
        })
    }
    else {
        // Tìm Email đã có sẵn chưa ?
        UserModel.findOne({email : email})
        .exec()
        .then(user =>{
            // nếu đã có thì báo
            if(user){
                res.json({
                    msg : false
                })
            }else{
                // không thì tạo mới
                const NewUser = new UserModel({
                    name,
                    email,
                    password
                });
                // mã hóa password
                bcrypt.genSalt(10, (err,salt) => bcrypt.hash(NewUser.password, salt, (err,hash) => {
                    if(err) throw err;
                    // Set password thành mã hóa
                    NewUser.password = hash;
                    // Sau đó là lưu
                    NewUser.save()
                    .then(user =>{
                        res.json({
                            msg : true
                        })
                    })
                    .catch(err => console.log(err))
                }))
            }
        })
    }
})

// Kiểm tra login
router.post('/login', (req,res,next) => {
    let email = req.body.email
    let password = req.body.password
    const user = {
        email : email
    }
    if(email && password){
        UserModel.findOne(user)
            .exec()
            .then(name => {
                console.log(name);
                if(!name){
                    res.status(401).json({
                        msg : false,
                    })
                } 
                return bcrypt.compare(password, name.password);
            })
            .then(samePassword => {
                if(samePassword){
                    jwt.sign({user : {email}}, process.env.SECRET_KEY , { expiresIn: '30s' }, (err, token) => {
                        res.status(200).json({
                        token,
                        msg : true
                        });
                    });
                }else{
                    res.status(401).json({
                        msg : false,
                    })
                }
            })
            .catch(err =>{
                console.log(err);
            })
    }
    
})

// Update User
router.patch("/:userId", verifyToken, (req,res,next) =>{
    let id = req.params.userId
    const updateOps = {};
    for (const ops of req.body){
        updateOps[ops.propsName] = ops.value;
    }
    UserModel.update({ _id : id }, {$set: updateOps } )
    .exec()
    .then(result => {
        res.json({
            msg : "Updated User"
        })
    })
    .catch(err => {
        console.log(err);
    })
})

//Delete User
router.delete('/:userId',verifyToken, (req,res,next) =>{
    let id = req.params.userId
    UserModel.remove({_id : id })
    .exec()
    .then(result => {
        res.json({
            msg : "Delete Done"
        })
    })
    .catch(err => {
        console.log(err);
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

module.exports = router
