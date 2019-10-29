var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify.js');
var task_phoneRouter = express.Router();
var tasks = require('../models/tasks');
var phone = require('../models/phone');
var task_phone = require('../models/task_phone');
var phone = require('../models/phone');
var Taskgroups = require('../models/taskgroups');


task_phoneRouter.use(bodyParser.json());

task_phoneRouter.route('/')

.post(Verify.verifyOrdinaryUser, function (req, res, next) {
    task_phone.create(req.body, function (err, t_p) {
        if (err) {next(err);
        }else{
            res.json(t_p);
            if(t_p){
                while(t_p.length > 0){
                    console.log('updating phone with task_phone_id remaining:', t_p.length);
                    updatePhonesWithTask_phone(t_p[0]);
                    t_p.shift();
                }
            }
        }
    });
})
.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    var tasks_phone_updated = [];
    console.log('estoy aqui ! ');
    console.log(req.body.length);
    console.log(req.body[0]);
    if(req.body.length){
        while(req.body.length > 0){
            tasks_phone_updated.push(updateTask_phone(req.body[0]));
            req.body.shift();
        }
        res.json(tasks_phone_updated);
    }else{
        res.json(updateTask_phone(req.body));
    }
    
})

.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    task_phone.remove({}, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

task_phoneRouter.route('/:task_phoneId')
.get(function (req, res, next) {
    task_phone.findById(req.params.task_phoneId)
        .exec(function (err, task_phone) {
        if (err) next(err);
        res.json(task_phone);
    });
})

.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    task_phoneRouter.findByIdAndUpdate(req.params.task_phoneId, {
        $set: req.body
    }, {
        new: true
    }, function (err, task_phone) {
        console.log(err);
        if (err) next(err);
        res.json(task_phone);
    });
})

.delete(Verify.verifyOrdinaryUser, Verify.verifyAdmin, function (req, res, next) {
        task_phoneRouter.findByIdAndRemove(req.params.task_phoneId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});



module.exports = task_phoneRouter;


function updatePhonesWithTask_phone(t_p){
    phone.findById(t_p.phone)
        .exec(function (err, p) {
        if (err) next(err);
        p.tasks_phone.push(t_p._id);
        var taskExists = false;
        for(var i = 0; i < p.tasks.length; i++){
            if(p.tasks[i] == t_p.task){
                taskExists = true;
            }
        }
        if(!taskExists){
            p.tasks.push(t_p.task);
        }

        phone.findByIdAndUpdate(t_p.phone , {
                $set: p
            }, {
                new: true
            }, function (err, task_phone) {
                if (err) next(err);
                console.log('phone updated', task_phone);
            });
    });
}
function updateTask_phone(p){
    console.log('updatingTaskphone');
    task_phone.findByIdAndUpdate(p._id, {
            $set: p
        }, {
            new: true
        }, function (err, pp) {
            if (err) next(err);
            return pp;
    });
}