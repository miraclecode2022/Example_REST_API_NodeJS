const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;