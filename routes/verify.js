var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js')

exports.getToken = function (user) {
  return jwt.sign(user, config.secretKey, {
    expiresIn: '7d'
  });
};

exports.verifyOrdinaryUser = function (req, res, next)
{
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
  if (token){
      
    jwt.verify(token, config.secretKey, function (err, decoded){
          if (err)
          {
            console.log("verify.err = " + err);
            var err = new Error('You are not authenticated!!!! verifyOrdinaryUser');
            err.status = 401;
            return next(err);
          }
          else{
            req.decoded = decoded;
            
            User.findOneAndUpdate({ username: req.decoded.username  }, {lastActivity: new Date() } )
                .exec(function (err, taskgroup) {
                if (err) next(err);
                next();
            })
          }
        });
  }
  else{
    var err = new Error('No token provided!');
    err.status = 403;
    return next(err);
  }
};

/////////////////////////////////////////////////////////////////////////////////// task 1 : verifyAdmin()

exports.verifyVet = function (req, res, next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
  if (token){
    jwt.verify(token, config.secretKey, function (err, decoded){
          if (err){
            var err = new Error('You are not authenticated to perfom this operation!');
            err.status = 401;
            return next(err);
          }else{
            req.decoded = decoded;

            if(!req.decoded.vet && !req.decoded.admin){
                var err = new Error('verifyVet:You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
              }else{
                User.findOneAndUpdate({ username: req.decoded.username  }, {lastActivity: new Date()} )
                  .exec(function (err, taskgroup) {
                      if (err) next(err);
                      next();
                  })
              }
          }
        });
  }
  else{
    var err = new Error('No token provided!');
    err.status = 403;
    return next(err);
  }
 };
exports.verifyAdmin = function (req, res, next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
  if (token){
    jwt.verify(token, config.secretKey, function (err, decoded){
          if (err){
            var err = new Error('You are not authenticated to perfom this operation!');
            err.status = 401;
            return next(err);
          }else{
            req.decoded = decoded;

            if(!req.decoded.admin){
                var err = new Error('verifyAdmin:You are not authorized to perform this operation!');
                err.status = 403;
                return next(err);
              }else{
                User.findOneAndUpdate({ username: req.decoded.username  }, {lastActivity: new Date()} )
                  .exec(function (err, taskgroup) {
                      if (err) next(err);
                      next();
                  })
              }
          }
        });
  }
  else{
    var err = new Error('No token provided!');
    err.status = 403;
    return next(err);
  }
 };