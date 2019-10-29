var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Race = new Schema({
    name_es: {
      type: String,
      default: ''
    },
    name_en: {
      type: String,
      default: ''
    },
    specie: {
        type : mongoose.Schema.ObjectId,
        ref: 'Specie'
    }

    
});

module.exports = mongoose.model('Race', Race);