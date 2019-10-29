var express = require('express');
var router = express.Router();
var User = require('../models/user')
var WaitingRoom = require('../models/waitingRoom')
var Verify = require('./verify')
var config = require('../config')
const mongoose = require('mongoose')
ObjectID = require('mongodb').ObjectID
/* GET home page. */

options = { upsert: true, new: true, setDefaultsOnInsert: true, multi: true }
router.route('/:userId')


/*
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    User.findById(req.params.userId)
        .exec(function (err, user) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        
        options = { upsert: true, new: true, setDefaultsOnInsert: true, multi: true };

        WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
                                    //      $pull : {clients : {"clients.lastActivity": { $lt: new Date() }}},
                                    // /       $pull : {vets: {"vets.lastActivity": { $lt: new Date() }}}
                                         }, options)
        .populate("clients")
        .populate("vets")
        .exec( function(error, waitingRoom) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                
                waitingRoom = checkIfIncluded(waitingRoom, user)

                WaitingRoom.findOneAndUpdate({}, waitingRoom, options)
                    .populate('vets')
                    .populate('clients')
                    .populate('videocalls')
                    .exec( function(error, waitingRoom) {
                        updateWaitingRoom(req, res, waitingRoom)
                    })
        })
    })

}) */

.put(Verify.verifyOrdinaryUser, function (req, res, next) {

  User.findByIdAndUpdate(req.params.userId, {status : 1}, options)
        .exec(function (err, user) {
        if (err) { return res.status(500).send({ msg: err.message }); }

        if(user.vet){
          WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
                                              $pull : {vets : req.params.userId}
                                      }, options)
                 .exec( function(err, waitingRoom) {
                            if (err) { return res.status(500).send({ msg: err.message }); }
                            res.status(200).json(waitingRoom)
                    })
        }else if(user.client){
          WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
                                              $pull : {clients : req.params.userId}
                                      }, options)
                 .exec( function(err, waitingRoom) {
                            if (err) { return res.status(500).send({ msg: err.message }); }
                            res.status(200).json(waitingRoom)
                    })
        }

        })
    
     })
.get(Verify.verifyOrdinaryUser, function (req, res, next) {

    

    User.findByIdAndUpdate(req.params.userId, {status : 1}, options)
        .exec(function (err, user) {
        if (err) { return res.status(500).send({ msg: err.message }); }
        
        if(user.vet){

            WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
                                              $addToSet: {vets: req.params.userId}
                                        //      $pull : {clients : {"clients.lastActivity": { $lt: new Date() }}},
                                        // /       $pull : {vets: {"vets.lastActivity": { $lt: new Date() }}}
                                             }, options)
          .populate({
              path: 'clients',
              select: 'username lang client lastActivity status urgent details',
              match: { lastActivity: { $gt: new Date(new Date().getTime() - config.waitingRoom.removeUserAt) }},
              populate : {path : 'details'}
          })
          .populate({
              path: 'vets',
              select: 'username lang vet lastActivity status urgent',
              match: { lastActivity: { $gt: new Date(new Date().getTime() - config.waitingRoom.removeUserAt) }}

          })
          .populate({
              path: 'videocalls',
              match: { vet: req.params.userId,
                       $and: [ {$or: [{status: 1},{ status : 2} ]},
                              {$or : [ {lastActivityClient: { $gt: new Date(new Date().getTime() - config.videoCall.removeAt) }}, 
                                        {lastActivityVet: { $gt: new Date(new Date().getTime() - config.videoCall.removeAt) }}
                                      ]}
                             ]
                     },
              select: 'client vet status roomCreated credits urgent',
              populate: [
                          {path: 'client',
                           populate : { path : 'details',
                                        select: 'firstname lastname'
                                      }
                          }, 
                          {path: 'vet',
                           populate : { path : 'details',
                                        select: 'firstname lastname'
                                      }
                         }]

          })
            .exec( function(error, waitingRoom) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
                    WaitingRoom.findOneAndUpdate({}, waitingRoom, options)
                   .exec(function(err2, waitingRoom2){
                      res.status(200).json(waitingRoom)
                   })
            })

        }else if(user.client){
          

          WaitingRoom.findOneAndUpdate({}, { lastActivity: new Date(),
                                            $addToSet: {clients: req.params.userId}
                                      //      $pull : {clients : {"clients.lastActivity": { $lt: new Date() }}},
                                      // /       $pull : {vets: {"vets.lastActivity": { $lt: new Date() }}}
                                           }, options)
          .populate({
              path: 'clients',
              select: 'username lang client lastActivity status urgent',
              match: { lastActivity: { $gt: new Date(new Date().getTime() - config.waitingRoom.removeUserAt) }}
          })
          .populate({
              path: 'vets',
              select: 'username lang vet details lastActivity status',
              match: { lastActivity: { $gt: new Date(new Date().getTime() - config.waitingRoom.removeUserAt) }},
              populate : {path : 'details'}
          })
          .populate({
              path: 'videocalls',
              match: { client: req.params.userId,
                      $and: [ {$or: [{status: 1},{ status : 2} ]},
                              {$or : [ {lastActivityClient: { $gt: new Date(new Date().getTime() - config.videoCall.removeAt) }}, 
                                        {lastActivityVet: { $gt: new Date(new Date().getTime() - config.videoCall.removeAt) }}
                                      ]}
                             ]
                     },
              select: 'client vet status roomCreated credits urgent',
              populate: [
                          {path: 'client',
                           populate : { path : 'details',
                                        select: 'firstname lastname'
                                      }
                          }, 
                          {path: 'vet',
                           populate : { path : 'details',
                                        select: 'firstname lastname'
                                      }
                         }]
          })
          .exec( function(error, waitingRoom) {
                  if (err) { return res.status(500).send({ msg: err.message }); }
                  res.status(200).json(waitingRoom)
          })
        }
    })

})
module.exports = router;


function checkIfIncluded(waitingRoom, user){
    var mustAdd = true
    if(user.vet){
      mustAdd = !waitingRoom.vets.some(function (vet) {
          return vet.equals(user._id)
      })      
      if(mustAdd){
        waitingRoom.vets.push(user._id)
      }
    }else if(user.client){
      mustAdd = !waitingRoom.clients.some(function (client) {
          return client.equals(user._id)
      })
      if(mustAdd){
        waitingRoom.clients.push(user._id)
      }
    }
    waitingRoom.clients.some(function (client) {
          return client.equals(user._id)
      })
    return waitingRoom 
}

function updateWaitingRoom(req, res, waitingRoom){
      var mustRemove = false
      var updatedClients = []
      var updatedVets = []

      for(client in waitingRoom.clients){
          if(new Date(client.lastActivity).getTime() - new Date().getTime() < config.waitingRoom.removeUserAt){
            updatedClients.push(client)
          }else{
            mustRemove = true
          }
      }
      for(vet in waitingRoom.vets){
          if(new Date(vet.lastActivity).getTime() - new Date().getTime() < config.waitingRoom.removeUserAt){
            updatedVets.push(client)
          }else{
            mustRemove = true
          }
      }

      if(mustRemove){
          WaitingRoom.findOneAndUpdate({}, waitingRoom)
                    .populate('vets')
                    .populate('clients')
                    .populate('videocalls')
                    .exec( function(err, waitingRoom) {
                        if (err) { return res.status(500).send({ msg: err.message }); }
                        res.status(200).json(waitingRoom)
                    })
      }else{
        res.status(200).json(waitingRoom)
      }
}