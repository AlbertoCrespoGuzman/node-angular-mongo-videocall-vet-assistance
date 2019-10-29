var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var Specie = new Schema({
    name_es: {
      type: String,
      default: ''
    },
    name_en: {
      type: String,
      default: ''
    }
    
});

module.exports = mongoose.model('Specie', Specie);