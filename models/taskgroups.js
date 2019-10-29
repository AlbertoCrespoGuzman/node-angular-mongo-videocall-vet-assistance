// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var taskgroupSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    lastupdate: {
        type: Number,
        required: true
    },
    users: [{
        type : mongoose.Schema.ObjectId,
        ref: 'User'
    }]
    ,
    phones: [{
        type : mongoose.Schema.ObjectId,
        ref: 'Phone'
    }]
});

// the schema is useless so far
// we need to create a model using it
var Taskgroups = mongoose.model('Taskgroup', taskgroupSchema);

// make this available to our Node applications
module.exports = Taskgroups;