var express = require('express');
var router = express.Router();
var User = require('../models/user')
var UserPayment = require('../models/userPayment')
var WaitingRoom = require('../models/waitingRoom')
var Verify = require('./verify')
var config = require('../config')
const mongoose = require('mongoose')
ObjectID = require('mongodb').ObjectID
var VideoCall = require('../models/videoCall')
/* GET home page. */
router.route('/vet/:userId/start')

.post(Verify.verifyVet, function (req, res, next) {
	console.log('VETERINATIO START')
	options = { upsert: true, new: true, setDefaultsOnInsert: true };

        	User.findByIdAndUpdate(req.params.userId, {  status: 2 }, options)
        		.select('-password')
        		.exec(function (err, vet) {
        			if (err) { return res.status(500).send({ msg: err.message }); }
        			console.log('1')
        			WaitingRoom.findOneAndUpdate({}, { lastActivityVet: new Date() }, options)
			            .exec(function(error, waitingRoom) {
			                if (err) { return res.status(500).send({ msg: err.message }); }
			                console.log('2')
			                if(waitingRoom.clients.length > 0){
			                	console.log('3 waitingRoom', waitingRoom)
		                		const clientId = waitingRoom.clients[0]
		                		User.findById(clientId)
		                		.select('-password')
		                		.populate('payment')
		                		.exec(function(err, client){
		                			console.log('4')
		                			if(client.urgent){
		                				if(client.payment.credits >= config.videoCall.urgentCreditCost){
		                					const videoCall = {
									        		startedAt: new Date(),
												    client: client._id,
												    vet: vet._id,
												    status: 1,
												    roomCreated: true,
												    urgent: client.urgent,
												    credits: client.urgent ? config.videoCall.urgentCreditCost : config.videoCall.defaultCreditCost 
									            }
									        VideoCall.create(videoCall, function (err, videocall){
									        		if(err) res.status(500).send({ msg: err.message })
									        		
									        		WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
									        											$push: {videocalls: videocall._id}},
									        											{upsert: true}, function(error, waitingRoom2) {
											                if (err) { return res.status(500).send({ msg: err.message }); }
											                	res.status(200).json(videocall)
									        			})
									        	})
		                				}else{
		                					 if (err) { return res.status(401).send({ err: req.__("NOT_ENOUGH_CREDITS") }); }
		                				}
		                			}else{
		                				console.log('5 client', client)
		                				if(client.payment.credits >= config.videoCall.defaultCreditCost){
		                					const videoCall = {
									        		startedAt: new Date(),
												    client: client._id,
												    vet: vet._id,
												    status: 1,
												    roomCreated: true,
												    urgent: client.urgent,
												    credits: client.urgent ? config.videoCall.urgentCreditCost : config.videoCall.defaultCreditCost 
									            }
									            console.log('6')
									        VideoCall.create(videoCall, function (err, videocall){
									        		if(err) res.status(500).send({ msg: err.message })
									        		console.log('7')
									        		WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
									        											$push: {videocalls: videocall._id}},
									        											{upsert: true}, function(error, waitingRoom2) {
											                if (err) { return res.status(500).send({ msg: err.message }); }
											                console.log('8')
											                	res.status(200).json(videocall)
									        			})
									        	})
		                				}else{
		                					console.log('9')
		                					 if (err) { return res.status(401).send({ err: req.__("NOT_ENOUGH_CREDITS") }); }
		                				}
		                			}		                		
		                		})
		                		
			        		}

		        		})
		    
		   

		})
})

router.route('/:videocallId/client/:userId/start/pet/:petId')

.post(Verify.verifyOrdinaryUser, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true };
	console.log('pet -> ', req.params.petId)
    User.findByIdAndUpdate(req.params.userId, {  status: 2 }, options)
		.exec(function (err, user) {
			if (err) { return res.status(500).send({ msg: err.message }); }
			if(user.client){
				WaitingRoom.findOneAndUpdate({}, { 
													lastActivityClient: new Date(),
													$pull: { clients: req.params.userId } }, options)
		            .exec(function(error, waitingRoom) {
		                if (err) { return res.status(500).send({ msg: err.message }); }
		                
				            VideoCall.findByIdAndUpdate(req.params.videocallId,
				            		 {
				            		   startedAt: new Date(), 
				            		   pet: req.params.petId,
				            		   status: 2
				            		 },
				            		  {upsert: true},
				            		 function (err, videocall){
				            			if(err) res.status(500).send({ msg: err.message })
		            					console.log('client start videoCall', videocall)
								        res.status(200).json(videocall)
					            	})
						})
	        	}else{
	        		return res.status(500).send({ msg: req.__("YOU_DOESNT_HAVE_PERMISSIONS") })
	        	}
		})
})

router.route('/:videocallId/user/:userId/stop')
.post(Verify.verifyOrdinaryUser, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true }
	
    User.findByIdAndUpdate(req.params.userId, {  status: 1}, options)
		.exec(function (err, user) {
			if (err) { return res.status(500).send({ msg: err.message }); }
			
			VideoCall.findByIdAndUpdate(req.params.videocallId, 
					{  status: 3,
						finishedAt: new Date()
					}, options)
			.populate({path: 'client',
						populate: {path: 'payment',
									select: 'credits'}})
			.exec(function (err, videocall) {
				if (err) { return res.status(500).send({ msg: err.message }); }

					User.findByIdAndUpdate(videocall.client._id, { urgent: false})
						.populate({ path: 'payment',
									select: 'credits'})
						.exec(function(err, client){
							
							UserPayment.findByIdAndUpdate(client.payment._id, {credits: client.payment.credits - videocall.credits}, options)
							.exec(function(err2, payment){
								console.log('paymente', payment)
								if(err2) res.status(500).send({msg: err2.message})
								if(user.vet){
										WaitingRoom.findOneAndUpdate({}, { lastActivityVet: new Date(),
																		   $pull: { videocalls: req.params.videocallId } }, options)
									            .exec(function(err, waitingRoom) {
									                if (err) { return res.status(500).send({ msg: err.message }); }
									                	res.status(200).json(videocall)
													})
							        }else if(user.client){
							        	WaitingRoom.findOneAndUpdate({}, { lastActivityClient: new Date(),
																   $pull: { videocalls: req.params.videocallId } }, options)
							            .exec(function(err, waitingRoom) {
							                if (err) { return res.status(500).send({ msg: err.message }); }
							                	res.status(200).json(videocall)
											})
							        }
							})

							
								
							})
					})
						
		})
})
router.route('/:videocallId/client')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true };
	
    VideoCall.findByIdAndUpdate(req.params.videocallId, {  lastActivityClient: new Date() })
					.populate({
	                    path: 'pet',
	                     populate: [{
	                          path: 'specie'
	                      },
	                      {
	                          path: 'race'
	                      }]
	                })
    				.exec( function (err, videocall){
    			if (err) { return res.status(500).send({ msg: err.message }); }
    						if(new Date().getTime() > new Date(videocall.lastActivityVet).getTime() + config.videoCall.removeAt){
								
								VideoCall.findByIdAndUpdate(req.params.videocallId, {  status: 4, finishedAt: new Date() })
								.populate({
					                    path: 'pet',
					                     populate: [{
					                          path: 'specie'
					                      },
					                      {
					                          path: 'race'
					                      }]
					                })
								.exec(function(err, videocall){
    												if (err) { return res.status(500).send({ msg: err.message }); }
    												res.status(200).json(videocall)
													})

							}else{
								res.status(200).json(videocall)	
							}
				                	
				})
    })
router.route('/:videocallId/vet')
.get(Verify.verifyVet, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true };
	
    VideoCall.findByIdAndUpdate(req.params.videocallId, {  lastActivityVet: new Date() })
						    .populate({
						        path: 'pet',
						         populate: [{
						              path: 'specie'
						          },
						          {
						              path: 'race'
						          }]
						    })
    						.exec( function (err, videocall){
    			if (err) { return res.status(500).send({ msg: err.message }); }
							if(new Date().getTime() > new Date(videocall.lastActivityClient).getTime() + config.videoCall.removeAt){
								
								VideoCall.findByIdAndUpdate(req.params.videocallId, {  status: 4, finishedAt: new Date() })
										.populate({
							                    path: 'pet',
							                     populate: [{
							                          path: 'specie'
							                      },
							                      {
							                          path: 'race'
							                      }]
							                }) 
											.exec(function (err, videocall){
    												if (err) { return res.status(500).send({ msg: err.message }); }
    												res.status(200).json(videocall)
													})

							}else{
								res.status(200).json(videocall)	
							}
				                	
				})
    })
router.route('/:videocallId/vet/:userId/overview')
.post(Verify.verifyVet, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true };
	
	User.findByIdAndUpdate(req.params.userId, {  status: 1}, options)
		.exec(function (err, user) {
			if (err) { return res.status(500).send({ msg: err.message }); }
			
			VideoCall.findByIdAndUpdate(req.params.videocallId, 
					{  overview: req.body.overview
					}, options)
			.exec(function (err, videocall) {
				if (err) { return res.status(500).send({ msg: err.message }); }
					res.status(200).json(videocall)
				})
		})
})

router.route('/:videocallId/client/:userId/rating')
.post(Verify.verifyOrdinaryUser, function (req, res, next) {

	options = { upsert: true, new: true, setDefaultsOnInsert: true };
	
	User.findByIdAndUpdate(req.params.userId, {  status: 1}, options)
		.exec(function (err, user) {
			if (err) { return res.status(500).send({ msg: err.message }); }
			
			VideoCall.findByIdAndUpdate(req.params.videocallId, 
					{  rating: req.body.rating
					}, options)
			.exec(function (err, videocall) {
				if (err) { return res.status(500).send({ msg: err.message }); }
				console.log('videocall', videocall)
					res.status(200).json(videocall)
				})
		})
    })
module.exports = router;
