var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favourites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.get(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({postedBy : req.decoded._doc._id})
        .populate('postedBy')
        .populate('dishes')
        .exec(function (err, favorite) {
        if (err) throw err;
        res.json(favorite);
    });
})

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    Favorites.findOne({postedBy : req.decoded._doc._id})
        .exec(function (err, favorite) {
        if (favorite == null)  {
		    Favorites.create({postedBy : req.decoded._doc._id, dishes: [req.body._id]}, function (err, favorite2) {
		    	res.json(favorite2);
		    });
        } else {
        	// check if dish is already n favorite.dishes
        	var found = false;
        	for (var i = 0; i < favorite.dishes.length; i++) {
        		if (favorite.dishes[i] == req.body._id) {
        			found = true;
        			break;
        		}
        	}
        	if (!found) {
	        	favorite.dishes.push(req.body._id);
	        	favorite.save(function (err, resp) {
	            	if (err) throw err;
	            	res.json(resp);
	        	});
        	} else {
        		res.json(favorite);
        	}
        }   
    });

})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.remove({postedBy : req.decoded._doc._id}, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

favoriteRouter.route('/:dishId')
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
	Favorites.findOne({postedBy : req.decoded._doc._id})
        .exec(function (err, favorite) {
        if (err) throw err;
        for (var i = 0; i < favorite.dishes.length; i++) {
            if (favorite.dishes[i] == req.params.dishId) {
            	favorite.dishes.splice(i, 1);
            	break;
            }
        }
        favorite.save(function (err, resp) {
         	if (err) throw err;
            res.json(resp);
        });
    });
});

module.exports = favoriteRouter;