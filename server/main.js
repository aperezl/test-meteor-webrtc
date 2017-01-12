import { Meteor } from 'meteor/meteor';
import '../imports/videochat/server.js';

Meteor.startup(() => {
  // code to run on server at startup
});


  Meteor.methods({
    "login_record" (username) {
      UserData.insert({
        username,
        time: new Date(),
        userData: Meteor.users.findOne({
          username
        }, {
          password: 0
        })
      })
    }
  })


UserPresence.onUserOnline(function(userId){
      Meteor.users.update({_id:userId}, {$set:{status:"online"}});
      console.log(userId + ' online...');
});

UserPresence.onUserIdle(function(userId){
  Meteor.users.update({_id:userId}, {$set:{status:"idle"}});
  console.log(userId + ' idle...');
});

UserPresence.onUserOffline(function(userId){
  Meteor.users.update({_id:userId}, {$set:{status:"offline"}});
  console.log(userId + ' offline...');
});
