// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//require('mongoose-currency').loadType(mongoose);
//var Currency = mongoose.Types.Currency;

var task_phoneSchema = new Schema({
    task: {
        type : mongoose.Schema.ObjectId,
        ref: 'Task'
    },
    phone: {
        type : mongoose.Schema.ObjectId,
        ref: 'Phone'
    },
    status:  {
        type: Number,
        required: true
    },
    description:  {
        type: String
    }
});


// the schema is useless so far
// we need to create a model using it
var Task_phone = mongoose.model('Task_phone', task_phoneSchema);

// make this available to our Node applications
module.exports = Task_phone;