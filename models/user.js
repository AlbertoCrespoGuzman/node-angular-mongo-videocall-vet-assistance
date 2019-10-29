var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
var bcrypt = require('bcrypt-nodejs')


var User = new Schema({
    username: {
      type:String,
      unique: true
    },
    password: { 
        type:String
    },
    lang: {
      type: String,
      default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    },
    vet:   {
        type: Boolean,
        default: false
    },
    client:   {
        type: Boolean,
        default: false
    },
    verified:   {
        type: Boolean,
        default: false
    },
    details: {
        type : mongoose.Schema.ObjectId,
        ref: 'UserDetails'
    },
    payment: {
        type : mongoose.Schema.ObjectId,
        ref: 'UserPayment'
    },
    lastActivity:{
      type:Date,
      default:Date.now
    },
    status:{
      type: Number,
      default: 1
    },
    urgent:{
        type: Boolean,
        default: false
    },
    pets: [{
        type : mongoose.Schema.ObjectId,
        ref: 'Pet'
    }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});



User.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (user.password && !user.isModified('password')) return next();
  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err)
      user.password = hash
      next()
    })
  })
})

User.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err)
    cb(null, isMatch)
  })
}
User.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', User);