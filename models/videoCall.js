var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var VideoCall = new Schema({
	startedAt:{
	      type:Date,
	      default:Date.now
    },
    lastActivityClient:{
        type: Date
    },
    lastActivityVet:{
        type: Date
    },
    finishedAt:{
        type: Date
    },
    client: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    },
    vet: {
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    },
    status: {
        type:Number
    },
    rating:{
        type:Number
    }, 
    overview:{
        type:String
    },
    roomCreated:{
        type: Boolean,
        default: false
    },
    credits:{
        type: Number,
        default : 1
    },
    urgent:{
        type: Boolean,
        default: false
    },
    pet: {
        type : mongoose.Schema.ObjectId,
        ref: 'Pet'
    }
});




module.exports = mongoose.model('VideoCall', VideoCall);