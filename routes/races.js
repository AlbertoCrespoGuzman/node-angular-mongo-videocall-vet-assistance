
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Verify = require('./verify');
var Races = require('../models/race')
var url = require('url');
var mongoose = require('mongoose');


 options = { upsert: true, new: true, setDefaultsOnInsert: true };
// Create the billing plan
router.route('/:specieId')
  .get(Verify.verifyOrdinaryUser, function (req, res, next){
  	console.log(req.params.specieId)
    
    Races.find({specie: req.params.specieId})
          
          .exec(function(err2, races){
            if(err2) res.code(500).json(err2)
              res.json(races)
          })
	})	
module.exports = router;
