const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: [true, 'Name product cannot blank'],
        unique : true
    },
    price: {
        type: Number,
        required: [true, 'Price cannot blank']
    },
    desc: {
        type: String,
        default: ''
    },
    type: {
        type: Number,
        default: 0
    }, 
    image: { 
        type: String,
        default: './imgs/noimage.jpg'
    },
    inCart: {
        type: Boolean,
        default: false
    },
    count: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    }
}, { versionKey: false })

module.exports = mongoose.model('Product', productSchema)