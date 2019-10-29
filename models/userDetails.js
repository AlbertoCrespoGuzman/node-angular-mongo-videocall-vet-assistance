var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var UserDetails = new Schema({
	firstname: {
      type: String,
      default: ''
    },
    lastname: {
      type: String,
      default: ''
    },
    birthday: {
      day: Number,
      month: Number,
      year: Number
    },
    phone: {
      code: String,
      phone: Number
    },
    city: {
      type: String, 
      default: ''
    },
    country: {
      type: String,
      default: ''
    },
    credits:{
      type: Number,
      default: 0
    },
    user: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('UserDetails', UserDetails);