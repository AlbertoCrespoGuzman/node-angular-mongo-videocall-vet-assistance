var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify.js');
var taskgroupRouter = express.Router();
var Taskgroups = require('../models/taskgroups');


taskgroupRouter.use(bodyParser.json());

taskgroupRouter.route('/')

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log(" -POST taskgroup ->   req.body = " + req.body);
    console.log(req.body);
 
    Taskgroups.create(req.body, function (err, taskgroup) {
        if (err) next(err);
        console.log('Taskgroup created!');
        var id = taskgroup._id;
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Added the taskgroup with id: ' + id);
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    Taskgroups.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

taskgroupRouter.route('/:taskgroupId')

.get(function (req, res, next) {

    Taskgroups.findById( req.params.taskgroupId )
    .populate('phones')
        .exec(function (err, taskgroup) {
        if (err) next(err);
        console.log(taskgroup)
        res.json(taskgroup);
    });

})
.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    Taskgroups.findByIdAndUpdate(req.params.taskgroupId, {
        $set: req.body
    }, {
        new: true
    }, function (err, taskgroup) {
        if (err) next(err);
        Taskgroups.findById(req.params.taskgroupId)
        .populate('phones')
        .exec(function (err, taskgroup) {
            if (err) next(err);
            res.json(taskgroup);
        });
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Taskgroups.findByIdAndRemove(req.params.taskgroupId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});
taskgroupRouter.route('/users/:userId')
.get(function (req, res, next) {

    Taskgroups.find({ users: req.params.userId } )
    .populate('phones')
        .exec(function (err, taskgroup) {
        if (err) next(err);
        console.log(taskgroup)
        res.json(taskgroup);
    });

});

module.exports = taskgroupRouter;