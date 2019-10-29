
var cronJob = require('cron').CronJob
var WaitingRoom = require('./models/waitingRoom')
var VideoCall = require('./models/videoCall')
var users = require('./models/users')

var updateVideoCallsTime = '0 */1 * * * *';


var job = new cronJob({ 
    cronTime: updateVideoCallsTime , 
    onTick: function(){
      updateVideoCalls()
    },
    start:true,
    timeZone:'America/Buenos_Aires'
});
function updateVideoCalls(){
  console.log('updatingVideoCalls')
  WaitingRoom.findOne({})
  				.populate('clients')
  				.populate('vets')
  				.populate('videocalls')
  				.exec(function(err, waitingRoom){

  				})
}

function checkClientsActivity(waitingRoom){
	
}

module.exports = job