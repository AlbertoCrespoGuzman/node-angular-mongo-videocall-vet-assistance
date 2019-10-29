var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify.js');
var taskRouter = express.Router();
var tasks = require('../models/tasks');
var Taskgroups = require('../models/taskgroups');


taskRouter.use(bodyParser.json());

taskRouter.route('/')

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log(" - tasks/ post -> ");
    console.log(req.body);
    tasks.create(req.body, function (err, task) {
        if (err) next(err);
        res.json(task);
        updateTaskgroup(task);
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    tasks.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

taskRouter.route('/:taskId')
.get(function (req, res, next) {
    tasks.findById(req.params.taskId)
        .exec(function (err, task) {
        if (err) next(err);
        res.json(task);
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    tasks.findByIdAndUpdate(req.params.taskId, {
        $set: req.body
    }, {
        new: true
    }, function (err, task) {
        if (err) next(err);
        updateTaskgroup(task);
        res.json(task);

    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        tasks.findByIdAndRemove(req.params.taskId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

taskRouter.route('/taskgroup/:taskgroupId')
.get(function (req, res, next) {
    console.log(req);
    tasks.find({ taskgroup : req.params.taskgroupId })
        .sort({initdate: 1})
        .exec(function (err, task) {
        if (err) next(err);
        res.json(task);
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    tasks.findByIdAndUpdate(req.params.taskId, {
        $set: req.body
    }, {
        new: true
    }, function (err, task) {
        if (err) next(err);
        res.json(task);
    });
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        tasks.findByIdAndRemove(req.params.taskId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});




module.exports = taskRouter;

function updateTaskgroup(task){
    Taskgroups.findById(task.taskgroup)
    .exec(function (err, taskgroup) {
        if (err) next(err);
        console.log("updateTaskgroup. Found! id = "+ taskgroup._id);
        taskgroup.lastupdate = task.lastupdatedtime;
        
         Taskgroups.findByIdAndUpdate( taskgroup._id , {
                $set: taskgroup
            }, {
                new: true
            }, function (err, taskgroup) {
                console.log("taskgroup updated time = " + taskgroup.lastupdate);
            });
    });
}