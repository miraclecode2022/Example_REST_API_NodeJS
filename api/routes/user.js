require('dotenv').config()
const express = require('express')
const UserModel = require('../models/users_model')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const multer = require("multer")
const cloudinary = require('cloudinary')

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
cloudinary.config({ 
    cloud_name: 'hqqovvbty', 
    api_key: '587633626684767', 
    api_secret: '1-FD6hS8giFV5MKhLRj9zpzlJvM' 
});
// Get All User on DB
router.get('/', (req, res, next)=>{
    UserModel.find()
    .exec()
    .then((users) => {
        res.json({
            count : users.length,
            users : users
        })
    })
    .catch(err => {
        console.log(err);
    })
})  

// Get one user with params name
router.get('/:userId', (req,res,next) => {
    let userId = req.params.userId
    UserModel.findOne({ _id:userId})
    .exec()
    .then(user => {
        if(user){
            res.json({
                user
            }) 
        } else {
            res.json({
                message: "Can not find this id user"
            }) 
        }
    })
    .catch(err => {
        console.log(err);
    })
})

// Tạo user
router.post('/register',upload.single('image'), (req,res,next) => {
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    let image = req.file.path
    // Check Require fields
    if(!name | !email | !password){
        res.json({
            status : false,
            message: "Fields can not blank"
        })
    }
    // Check password and password2 is match
    // if(password !== password2){
    //     res.json({
    //         msg : false
    //     })
    // }
    // Check length password
    if(password.length < 6){
        res.json({
            status : false,
            message: "Password must be more than 6 characters"
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
                    status : false
                })
            }else{
                // không thì tạo mới
                cloudinary.uploader.upload(image, (result) => {
                    const NewUser = new UserModel({
                        _id: new mongoose.Types.ObjectId(),
                        name,
                        email,
                        password,
                        image : result.secure_url
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
                                status : true,
                                message: "Create was successful"
                            })
                        })
                        .catch(err => console.log(err))
                    }))
                })
            }
        })
    }
})

// Kiểm tra login
router.post('/login', (req, res, next) => {
    let password = req.body.password;
    let email = req.body.email;
    var data;
    // console.log(password ? true : false + ' - ' + email ? true : false)
    if(email && password) {
        data = {
            email: email,
        }
        UserModel.findOne(data)
        .then(user => {
            if (!user) {
                res.status(401).json({
                    message: 'Email does not exist',
                });
            }
            return bcrypt.compare(password, user.password);
        })
        .then(samePassword => {
            if(!samePassword) {
                res.status(401).json({
                    message: 'Incorrect email or password',
                });
            }
            jwt.sign({ user: { email: email }}, process.env.SECRET_KEY, { expiresIn: "7d" }, (err, token) => {
                res.status(200).json({
                    message: 'Login successful',
                    token: token
                });
            })
        })
        .catch(err => console.log(err))
    } else {
        res.status(401).json({
            message: 'Email and password cannot be empty'
        });
    }
})

// Update User
router.patch("/:userId", verifyToken, (req,res,next) =>{
    let id = req.params.userId
    const input = req.body;
    for (const key of Object.keys(input)){

    }
    UserModel.updateOne({ _id : id }, {$set: input } )
    .exec()
    .then(result => {
        res.json({
            msg : "Updated User Success"
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

router.post('/verify', (req, res, next) => {
    const token = req.body.access_token
    jwt.verify(token, process.env.SECRET_KEY, function(err, data) {
        if(data){
            res.status(200).json({
                live: true
            })
        } else {
            res.status(200).json({
                live: false
            })
        }
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
