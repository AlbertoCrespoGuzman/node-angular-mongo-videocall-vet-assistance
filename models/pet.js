var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Pet = new Schema({
    name: {
      type: String,
      default: ''
    },
    specie: {
        type : mongoose.Schema.ObjectId,
        ref: 'Specie'
    },
    birthday: Number,
    race: {
        type : mongoose.Schema.ObjectId,
        ref: 'Race'
    },
    weight: Number
    ,
    country: {
      type: String,
      default: ''
    },
    user: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Pet', Pet);