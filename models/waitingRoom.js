var mongoose = require('mongoose')
var Schema = mongoose.Schema;


var WaitingRoom = new Schema({
	lastActivity:{
	      type:Date,
	      default:Date.now
    },
    clients: [{
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    vets: [{
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    videocalls: [{
        type: mongoose.Schema.ObjectId,
        ref:'VideoCall'
    }]
});




module.exports = mongoose.model('WaitingRoom', WaitingRoom);