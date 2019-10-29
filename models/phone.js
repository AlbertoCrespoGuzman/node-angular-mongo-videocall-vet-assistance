// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
//require('mongoose-currency').loadType(mongoose);
//var Currency = mongoose.Types.Currency;

var phoneSchema = new Schema({

	refid:  {
        type: Number
    },
    name:  {
        type: String
    },
    cpf:  {
        type: String
    },
    agency:  {
        type: Boolean
    },
    birth:  {
        type: String
    },
    phone:  {
        type: String
    },
    address:  {
        type: String
    },
    district:  {
        type: String
    },
    cep:  {
        type: String
    },
    city:{
        type: String
    },
    latitude:  {
        type: SchemaTypes.Double
    },
    longitude:  {
        type: SchemaTypes.Double
    },
    
    tasks: [{
        type : mongoose.Schema.ObjectId,
        ref: 'Task'
    }],
    
    tasks_phone: [{
        type : mongoose.Schema.ObjectId,
        ref: 'Task_phone'
    }]
});


// the schema is useless so far
// we need to create a model using it
var Phone = mongoose.model('Phone', phoneSchema );

// make this available to our Node applications
module.exports = Phone;