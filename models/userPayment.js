var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var UserPayment = new Schema({
	
    credits:{
      type: Number,
      default: 0
    },
    user: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('UserPayment', UserPayment);