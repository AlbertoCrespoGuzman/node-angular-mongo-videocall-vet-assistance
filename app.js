var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cors= require('cors');
var config = require('./config');
var https = require('https');
var fs = require('fs');
const port = 3445
//var job = require('./cronjobs')


var i18n = require("i18n")
i18n.configure({
    locales:['en', 'es'],
    fallback: 'es',
    logDebugFn: function (msg) {
        console.log('debug', msg);
    },
    directory: path.join(__dirname + '/locales')
});


var app = express();
//body Parser
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(i18n.init)

// passport config
var User = require('./models/user');
app.use(passport.initialize());
//passport.use(new LocalStrategy(User.authenticate()));
passport.use(new LocalStrategy(function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      console.log(user.password)
      if (err) return done(err);
      if (!user) return done(null, false, { msg: i18n.__("USERNAME_WRONG") })
      user.comparePassword(password, function(err, isMatch) {
        if (isMatch) {
          return done(null, user)
        } else {
          i18n.setLocale(user.lang)
          return done(null, false, { msg: i18n.__("PASSWORD_WRONG") })
        }
      })
    })
}))
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



var routes = require('./routes/index');
var login = require('./routes/login');
var users = require('./routes/users')
var pets = require('./routes/pets')
var species = require('./routes/species')
var races = require('./routes/races')
var paypal = require('./routes/paypal')
var waitingRoom = require('./routes/waitingRoom')
var videoCall = require('./routes/videocall')
var taskRouter = require('./routes/taskRouter');
var taskgroupRouter = require('./routes/taskgroupRouter');
var phoneRouter = require('./routes/phoneRouter');
var task_phoneRouter = require('./routes/task_phoneRouter');


// Secure traffic only
app.all('*', function(req, res, next){
   var responseSettings = {
        "AccessControlAllowOrigin": req.headers.origin,
        "AccessControlAllowHeaders": "Content-Type,X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,  Date, X-Api-Version, X-File-Name",
        "AccessControlAllowMethods": "POST, GET, PUT, DELETE, OPTIONS",
        "AccessControlAllowCredentials": true
    };

    res.header("Access-Control-Allow-Credentials", responseSettings.AccessControlAllowCredentials);
    res.header("Access-Control-Allow-Origin",  responseSettings.AccessControlAllowOrigin);
    res.header("Access-Control-Allow-Headers", (req.headers['access-control-request-headers']) ? req.headers['access-control-request-headers'] : "x-requested-with");
    res.header("Access-Control-Allow-Methods", (req.headers['access-control-request-method']) ? req.headers['access-control-request-method'] : responseSettings.AccessControlAllowMethods);

    return next();
});
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
//app.use(logger('combined'));



app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users)
app.use('/paypal', paypal)
app.use('/pets',pets)
app.use('/species',species)
app.use('/races',races)
app.use('/waitingroom', waitingRoom)
app.use('/videocall', videoCall)
app.use('/login', login);
app.use('/tasks',taskRouter);
app.use('/taskgroup',taskgroupRouter);
app.use('/phones',phoneRouter);
app.use('/task_phone',task_phoneRouter)




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
  // development error handler
  // will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

  // production error handler
  // no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});
/* app.listen(3445, function(){
  console.info('Server listening on port ' + this.address().port);
}); */

mongoose.connect(config.mongoUrl, config.useMongoClient);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected correctly to db server");
    User.findOne({username: config.master.username})
          .exec( function(err, user){
              if(err) {
                console.log(err);
              }
              var message;
              if(user) {
                  message = "admin master OK " + JSON.stringify(user);
                  console.log(message)
              } else {
                  message= "admin master doesn't exist";
                  console.log(message);
                  User.register(new User({ username : config.master.username, password: config.master.password }),
                        config.master.password, function(err, user) {
                          if(err) console.log(err)
                            user.firstname = 'admin';
                            user.lastname = 'admin';
                            user.admin = true;
                            user.save(function(err,user) {
                                console.log('admin created successfully')
                            });
                    });
              }
           });
  
});

const httpsOptions = {
  key: fs.readFileSync('./keys/key.pem'),
  cert: fs.readFileSync('./keys/cert.pem')
}

var httpsServer = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})

// /job.start()
 
 mongoose.set('debug', true);
module.exports = app;

