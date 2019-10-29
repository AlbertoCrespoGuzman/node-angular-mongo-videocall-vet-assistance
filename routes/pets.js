
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Verify = require('./verify');
var Pets = require('../models/pet')
var url = require('url');
var User = require('../models/user')
var mongoose = require('mongoose');


 options = { upsert: true, new: true, setDefaultsOnInsert: true };
// Create the billing plan

router.route('/')
  .get(Verify.verifyOrdinaryUser, function (req, res, next){
    Pets.find({})
          .populate('specie')
		  .populate('race')
          .exec(function(err2, pet){
            if(err2) res.code(500).json(err2)
              res.json(pet)
          })
	})	

router.route('/:petId')
  .get(Verify.verifyOrdinaryUser, function (req, res, next){
    Pets.findOne({_id: req.params.petId})
          .populate('specie')
		  .populate('race')
          .exec(function(err2, pet){
            if(err2) res.code(500).json(err2)
              res.json(pet)
          })
	})	
  .post(Verify.verifyOrdinaryUser, function(req, res, next){
		Pets.create(  req.body, function(err, pet){
				console.log(err)
				if(err) res.code(500).json(err)
					User.findOneAndUpdate( { _id: pet.user }, { "$push": { "pets": pet } }, options)
					    .exec( function(err, user){
					    	console.log(user)
					      if(err) res.status(500).json({error: err})
					        Pets.findOne( {_id :pet._id})
						          .populate('specie')
									.populate('race')
							          .exec(function(err2, pet){
							            if(err2) res.code(500).json(err2)
							              res.json(pet)
							          })
					    })
					
			})
	})
  .put(Verify.verifyOrdinaryUser, function(req, res, next){
		Pets.update({_id: req.params.petId }, options, req.body)
			.exec(function(err, pet){
				
				if(err) res.code(500).json(err)

				Pets.findOne( {_id :pet._id})
		          .populate('specie')
					.populate('race')
			          .exec(function(err2, pet){
			            if(err2) res.code(500).json(err2)
			              res.json(pet)
			          })
			})
	})
module.exports = router;