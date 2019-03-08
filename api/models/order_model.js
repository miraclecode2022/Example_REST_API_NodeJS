const mongoose = require('mongoose')
let dateFormat = require('dateformat')

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,

    customer : {
        type: {
            customer: {
                firstname: {
                    type: String
                },
                lastname: {
                    type: String
                },
                address: {
                    type: String
                },
                city: {
                    type: String
                },
                district: {
                    type: Number
                },
                phone: {
                    type: Number
                },
                email: {
                    type: String
                }
            }
        }
    },
    products : {
        type: [{
            count: {
                type: Number
            },
            total: {
                type: Number
            },
            _id: {
                type: String
            }
        }]
    },
    status: { type: Number, default: 0},
    date : {
        type: Date,
        default: dateFormat( new Date(), "dd-mm-yyyy h:MM:ss")
    }
    
}, { versionKey: false })

module.exports = mongoose.model('Order', orderSchema)