const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    trim : true,
    required: [true, 'Name product cannot blank']
  },
  email: {
    type: String,
    required: true,
    unique : true,
    required: [true, 'Email product cannot blank']
  },
  password: {
    type: String,
    required: true,
    required: [true, 'Password product cannot blank']
  },
  image:{
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;