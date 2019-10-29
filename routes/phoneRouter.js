var express = require('express');
var bodyParser = require('body-parser');
var Verify = require('./verify.js');
var phoneRouter = express.Router();
var phone = require('../models/phone');
var task_phone = require('../models/task_phone');
var Taskgroups = require('../models/taskgroups');

phoneRouter.use(bodyParser.json());

phoneRouter.route('/')
.get(function (req, res, next) {
    phone.find({})
    .populate("tasks")
        .exec(function (err, phones) {
        if (err) next(err);
        res.json(phones);
    });
})
.post(Verify.verifyOrdinaryUser, function (req, res, next) {

    var phones_created = [];
    console.log('posting phone', req.body.length);
    if(req.body.length){
        while(req.body.length > 0){
            phones_created.push(createIfNotExistsPhone(req.body[0]));
            req.body.shift();
        }
        res.json(phones_created);
    }else{
        createIfNotExistsPhone(req.body);
    }
})
.put(Verify.verifyOrdinaryUser, function (req, res, next) {
    console.log('updating phone', req.body.length);
    var phones_updated = [];
    while(req.body.length > 0){
        phones_updated.push(updatePhone(req.body[0]));
        req.body.shift();
    }
    res.json(phones_updated);
})
.delete(Verify.verifyOrdinaryUser, function (req, res, next) {
    phone.findByIdAndRemove(req.params.phoneId, function (err, resp) {
        if (err) next(err);
        res.json(resp);
    });
});

phoneRouter.route('/:phoneId')
    .get(function (req, res, next) {
        console.log('get phone', req.body.length);
        phone.findById(req.params.phoneId)
            .exec(function (err, phone) {
            if (err) next(err);
            res.json(phone);
        });
    })

    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log('updating phone', req.body.length);
        phone.findByIdAndUpdate(req.params.phoneId, {
            $set: req.body
        }, {
            new: true
        }, function (err, phone) {
            if (err) next(err);
            res.json(phone);

        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
            phone.findByIdAndRemove(req.params.phoneId, function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });

phoneRouter.route('/taskgroup/:taskgroupId')
    .get(function (req, res, next) {
        console.log('get phone /taskgroup', req.body.length);
        console.log(req);
        phone.find({ taskgroup : req.params.taskgroupId })
            .sort({inittime: 1})
            .exec(function (err, task) {
            if (err) next(err);
            res.json(task);
        });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log(" - phone/ post -> /taskgroup");
        console.log(req.body);
        phone.create(req.body, function (err, phone) {
            if (err) next(err);
            console.log('phone created!');
            console.log(phone);
            var id = phone._id;
            updateTaskgroup(id,req.params.taskgroupId,res);
            
        });
    })
    .put(Verify.verifyOrdinaryUser, function (req, res, next) {
        console.log(" - phone/ update -> /taskgroup");
        phone.findByIdAndUpdate(req.params.taskgroupId, {
            $set: req.body
        }, {
            new: true
        }, function (err, task) {
            if (err) next(err);
            res.json(task);
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
            phone.findByIdAndRemove(req.params.taskId, function (err, resp) {
            if (err) next(err);
            res.json(resp);
        });
    });
    
phoneRouter.route('/search/:name/:taskgroupId')
    .get(function (req, res, next) {
        Taskgroups.findById(req.params.taskgroupId)
        .populate("phones")
        .exec(function (err, taskgroup) {
            
            phone.find(  { name : {"$regex": req.params.name, "$options": "i"} }   )
                .exec(function (err, phone) {
                if (err) next(err);
                
                for(var i=0; i<taskgroup.phones.length;i++){
                    for(var j=0; j<phone.length;j++){
                        console.log( taskgroup.phones[i]._id + " === " + phone[j]._id  + " equal? -> " + (taskgroup.phones[i]._id.equals(phone[j]._id)));
                            if(taskgroup.phones[i]._id.equals(phone[j]._id)){
                                phone.splice(j,1);
                            }
                    }
                }
                res.json(phone);
            });
        });
    });


phoneRouter.route('/task/:taskId')
    .get(function (req, res, next) {
        console.log(" - phone/ get -> /task");
        var taskid = req.params.taskId;
        console.log('taskid', taskid);
        phone.find({ tasks : req.params.taskId })
            .populate('tasks')
            .populate({
                path: 'tasks_phone',
                match: { task:    taskid  },
                options: { limit: 1 }
              })
            .exec(function (err, phones) {
            if (err) next(err);
            res.json(phones);
            
        });
    })

    

module.exports = phoneRouter;

function updateTaskgroup(idphone, idtaskgroup,res){
    console.log("updateTaskgroup");
    Taskgroups.findById(idtaskgroup)
    .exec(function (err, taskgroup) {
        if (err) next(err);
        taskgroup.phones = taskgroup.phones.push(idphone);
        
         Taskgroups.findByIdAndUpdate( taskgroup._id , {
                $set: taskgroup
            }, {
                new: true
            }).populate("phones")
            .exec(function (err, taskgroup) {
                if (err) next(err);
                res.json(taskgroup);
            });
    });
}

function updatePhone(p){
    phone.findByIdAndUpdate(p._id, {
            $set: p
        }, {
            new: true
        }, function (err, pp) {
            if (err) next(err);
            return pp;
    });
}

function createIfNotExistsPhone(p){
    
    phone.find({ phone : p.phone })
        .exec(function (err, ph) {
        if (err) {
            return false;
        }else{
            if(ph.length > 0){
              console.log('existing phone, not saving', ph)
                return true; 
            }else{
                console.log('phone before save', p);
                p.phone = (p.phone + "").replace(" ","").replace("-","").replace("(","").replace(")","");
                phone.create(p, function (err, pp) {
                if (err) next(err);
                return pp;
            });
            }
        }
    });
}