
var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var Verify = require('./verify');
var url = require('url')
var Species = require('../models/specie')

 options = { upsert: true, new: true, setDefaultsOnInsert: true };
// get Species
router.route('/')
  .get(Verify.verifyOrdinaryUser, function (req, res, next){
    Species.find({}, function (err, species)
    {
      if (err) throw err;
      res.json(species);
    });
  })

module.exports = router;
