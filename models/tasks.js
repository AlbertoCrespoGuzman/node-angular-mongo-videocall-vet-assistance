// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//require('mongoose-currency').loadType(mongoose);
//var Currency = mongoose.Types.Currency;

var taskSchema = new Schema({
    name:  {
        type: String,
        required: true
    },
    initdate:  {
        type: Number,
        required: true
    },
    lastupdatedtime:  {
        type: Number,
        required: true
    },
    sentdate:  {
        type: Number,
        required: true
    },
    scheduleddate:  {
        type: Number,
        required: true
    },
    status:  {
        type: Number,
        required: true
    },
    sms:  {
        type: String,
        required: true
    },
    taskgroup: {
        type : mongoose.Schema.ObjectId,
        ref: 'Taskgroup'
    }
});


// the schema is useless so far
// we need to create a model using it
var Tasks = mongoose.model('Task', taskSchema);

// make this available to our Node applications
module.exports = Tasks;