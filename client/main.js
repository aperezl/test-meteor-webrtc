import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';
import '../imports/videochat/client.js';

Template.body.onRendered(renderCallTemplate);

 Template.body.helpers({
  loggedIn() {
    return Meteor.user() || Meteor.loggingIn();
  }
 });

Meteor.startup(function() {

  Meteor.VideoCallServices.onReceivePhoneCall = function() {
    console.log('Reciving call');
  };

  Meteor.VideoCallServices.onCallTerminated = function() {
    console.log(this);
    console.log('Modal.hide()');
  };


  Meteor.VideoCallServices.onCallIgnored = function() {
    alert("call ignored");
  };

  Meteor.VideoCallServices.onWebcamFail = function(error) {
    console.log("Failed to get webcam", error);
  };

  Meteor.VideoCallServices.elementName = "MeteorVideoChat";

  Meteor.VideoCallServices.STUNTURN = {
      "iceServers": [{
        url: 'stun:stun01.sipphone.com'
      }, {
        url: 'stun:stun.ekiga.net'
      }, {
        url: 'stun:stun.fwdnet.net'
      }, {
        url: 'stun:stun.ideasip.com'
      }, {
        url: 'stun:stun.iptel.org'
      }, {
        url: 'stun:stun.rixtelecom.se'
      }, {
        url: 'stun:stun.schlund.de'
      }, {
        url: 'stun:stun.l.google.com:19302'
      }, {
        url: 'stun:stun1.l.google.com:19302'
      }, {
        url: 'stun:stun2.l.google.com:19302'
      }, {
        url: 'stun:stun3.l.google.com:19302'
      }, {
        url: 'stun:stun4.l.google.com:19302'
      }, {
        url: 'stun:stunserver.org'
      }, {
        url: 'stun:stun.softjoys.com'
      }, {
        url: 'stun:stun.voiparound.com'
      }, {
        url: 'stun:stun.voipbuster.com'
      }, {
        url: 'stun:stun.voipstunt.com'
      }, {
        url: 'stun:stun.voxgratia.org'
      }, {
        url: 'stun:stun.xten.com'
      }, {
        url: 'turn:numb.viagenie.ca',
        credential: 'muazkh',
        username: 'webrtc@live.com'
      }, {
        url: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }, {
        url: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
      }]

    };

  Meteor.VideoCallServices.setRingtone('/nokia.mp3');

});


  Template.MeteorVideoChat.events({
    "click .action_logout" () {
      Meteor.logout(function(err) {
        if (err) toastr.error(err.message);
        else toastr.success("Logged out");
      })
    },
    "click #answer_call": function() {
      Meteor.VideoCallServices.setLocalWebcam("videoChatCallerVideo");
      Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");
      let self = this;
      const receiving = Meteor.VideoCallServices.VideoChatCallLog.findOne({
        $or: [{
          status: "C",
        }, {
          status: "R",
        }],
        callee_id: Meteor.userId()
      });
      console.log('receiving', receiving)
      //Try auto answer
      Meteor.VideoCallServices.loadLocalWebcam(false, function() {
        Meteor.VideoCallServices.answerCall();
      });
    },
    "click #ignore_call": function() {
      Meteor.VideoCallServices.ignoreCall();
    },
    "click .userIDLink": function(event) {
      console.log('call', this._id, this.username);
      var _callee = this._id;
      Meteor.VideoCallServices.setLocalWebcam("videoChatCallerVideo");
      Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");


      let self = this;
      const receiving = Meteor.VideoCallServices.VideoChatCallLog.findOne({
        $or: [{
          status: "C",
        }, {
          status: "R",
        }],
        callee_id: Meteor.userId()
      });
      console.log('receiving', receiving)
      Meteor.VideoCallServices.loadLocalWebcam(true, function() {
        Meteor.VideoCallServices.callRemote(_callee)
      });



      //Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");


    }
  });


  Template.MeteorVideoChat.helpers({
    check(asd) {
      console.log(asd);
    },
    hasUsers() {
      return Meteor.users.find({
        _id: {
          $ne: Meteor.userId()
        }
      }).count() > 0;
    },
    getUsers() {
      return Meteor.users.find({
        _id: {
          $ne: Meteor.userId()
        }
      });
    },
    getStatus() {
      let callState = Session.get("callState");
      if (callState)
        return callState.message;
    }
  })


  Template.MeteorVideoChat.onRendered(function() {
    Meteor.subscribe("userList");


  })

/*
  Template.chatModal.onCreated(function() {
    Meteor.VideoCallServices.setLocalWebcam("videoChatCallerVideo");
    Meteor.VideoCallServices.setRemoteWebcam("videoChatAnswerVideo");
  })
*/
/*
  Template.chatModal.onRendered(function() {

    let self = this;
    const receiving = Meteor.VideoCallServices.VideoChatCallLog.findOne({
      $or: [{
        status: "C",
      }, {
        status: "R",
      }],
      callee_id: Meteor.userId()
    });
    if (!receiving)
      Meteor.VideoCallServices.loadLocalWebcam(true, function() {
        console.log("callback");
        Meteor.VideoCallServices.callRemote(self.data.callee)
      });


  })
*/

 /* Template.chatModal.onDestroyed(function() {}); */

/*
  Template.chatModal.events({
    "click #answerCall" (event, template) {
      Meteor.VideoCallServices.loadLocalWebcam(false, function() {
        Meteor.VideoCallServices.answerCall();
      });
    },
    "click #ignoreCall" (event, template) {
      Meteor.VideoCallServices.ignoreCall();
      Modal.hide(template);
    },
    "click #closeChat": function(event, template) {
      Meteor.VideoCallServices.callTerminated();
      Modal.hide(template);
    }
  })
*/

/*
  Template.chatModal.helpers({
    getCallerName() {
      let callData = Meteor.VideoCallServices.VideoChatCallLog.findOne({
        _id: Session.get("currentPhoneCall")
      });
      return Meteor.users.findOne({
        _id: callData.caller_id
      }).username;
    },
    getStatus() {
      let callState = Session.get("callState");
      if (callState)
        return callState.message;
    },
    incomingPhoneCall() {
      return Meteor.VideoCallServices.VideoChatCallLog.findOne({
        $or: [{
          status: "C",
        }, {
          status: "R",
        }],
        callee_id: Meteor.userId()
      });
    }
  })
*/

  Template.LoginPage.events({
    "submit #loginForm" (event) {
      console.log("login form");
      event.preventDefault();
      const userName = event.target[0].value;
      const accountData = {
        username: userName,
        password: userName
      };
      Accounts.createUser(accountData, (err) => {
        if (err) console.log(err.message);
        Meteor.call("login_record", userName);
      });

    }
  })
