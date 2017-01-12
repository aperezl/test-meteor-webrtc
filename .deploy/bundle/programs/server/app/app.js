var require = meteorInstall({"lib":{"collections.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// lib/collections.js                                                                                                  //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
UserData = new Meteor.Collection("UserData");                                                                          // 1
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

},"template.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// lib/template.js                                                                                                     //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
renderCallTemplate = function renderCallTemplate(template) {                                                           // 1
    Session.set("currentPhoneCall", null);                                                                             // 2
    Session.set("phoneIsRinging", false);                                                                              // 3
    Session.set("remoteIceCandidates", []);                                                                            // 4
    Session.set("callState", null);                                                                                    // 5
    Session.set("");                                                                                                   // 6
    if (!template) var self = this;else var self = template;                                                           // 7
    /*                                                                                                                 // 9
     *   Autorun is used to detect changes in the publication.                                                         //
     *   The functionality triggered by changes is used to devise as to                                                //
     *   whether the phone is ringing.                                                                                 //
     *                                                                                                                 //
     */                                                                                                                //
    console.log("created");                                                                                            // 15
    self.autorun(function () {                                                                                         // 16
        console.log("call autorun");                                                                                   // 17
        self.subscribe("VideoCallChatLog");                                                                            // 18
        var newIncomingCall = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                      // 19
            status: "C",                                                                                               // 20
            callee_id: Meteor.userId()                                                                                 // 21
        });                                                                                                            // 19
        if (newIncomingCall) {                                                                                         // 23
            Session.set("localIceCandidates", []);                                                                     // 24
            Session.set("addedIceCandidates", null);                                                                   // 25
            console.log("incoming call");                                                                              // 26
            Session.set("callState", {                                                                                 // 27
                message: "Received Call",                                                                              // 28
                status: "R",                                                                                           // 29
                caller: newIncomingCall.caller_id,                                                                     // 30
                callee: newIncomingCall.callee_id,                                                                     // 31
                timestamp: new Date()                                                                                  // 32
            });                                                                                                        // 27
            Session.set("currentPhoneCall", newIncomingCall._id);                                                      // 34
            Meteor.VideoCallServices.startRingtone();                                                                  // 35
            Meteor.VideoCallServices._loadRTCConnection();                                                             // 36
            Meteor.VideoCallServices._setUpCalleeEvents();                                                             // 37
            Meteor.VideoCallServices._setUpMixedEvents();                                                              // 38
            Meteor.VideoCallServices.VideoChatCallLog.update({                                                         // 39
                _id: newIncomingCall._id                                                                               // 40
            }, {                                                                                                       // 39
                $set: {                                                                                                // 42
                    status: "R",                                                                                       // 43
                    conn_dt: new Date().getTime()                                                                      // 44
                }                                                                                                      // 42
            });                                                                                                        // 41
            Meteor.VideoCallServices.onReceivePhoneCall();                                                             // 47
        }                                                                                                              // 48
        var answeredCall = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                         // 49
            status: "A",                                                                                               // 50
            callee_id: Meteor.userId()                                                                                 // 51
        });                                                                                                            // 49
        if (answeredCall) {                                                                                            // 53
            Session.set("inCall");                                                                                     // 54
            Meteor.VideoCallServices.stopRingtone();                                                                   // 55
            Session.set("callState", {                                                                                 // 56
                message: "Answered",                                                                                   // 57
                status: "A",                                                                                           // 58
                caller: answeredCall.caller_id,                                                                        // 59
                callee: answeredCall.callee_id,                                                                        // 60
                timestamp: new Date()                                                                                  // 61
            });                                                                                                        // 56
        }                                                                                                              // 63
        var ignoredCall = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                          // 64
            _id: Session.get("currentPhoneCall"),                                                                      // 65
            caller_id: Meteor.userId(),                                                                                // 66
            status: "IG"                                                                                               // 67
        });                                                                                                            // 64
        if (ignoredCall) {                                                                                             // 69
            Meteor.VideoCallServices.onCallIgnored();                                                                  // 70
            Session.set("callState", {                                                                                 // 71
                message: "Ignored",                                                                                    // 72
                status: "IG",                                                                                          // 73
                                                                                                                       //
                caller: ignoredCall.caller_id,                                                                         // 75
                callee: ignoredCall.callee_id,                                                                         // 76
                timestamp: new Date()                                                                                  // 77
            });                                                                                                        // 71
        }                                                                                                              // 79
                                                                                                                       //
        var cancelledCall = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                        // 81
            _id: Session.get("currentPhoneCall"),                                                                      // 82
            status: "D"                                                                                                // 83
        });                                                                                                            // 81
        if (cancelledCall) {                                                                                           // 85
            Meteor.VideoCallServices.callTerminated();                                                                 // 86
            Session.get("callState", {                                                                                 // 87
                message: "Cancelled",                                                                                  // 88
                status: "D",                                                                                           // 89
                caller: cancelledCall.caller_id,                                                                       // 90
                callee: cancelledCall.callee_id,                                                                       // 91
                timestamp: new Date()                                                                                  // 92
            });                                                                                                        // 87
        }                                                                                                              // 94
        var iceFailed = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                            // 95
            _id: Session.get("currentPhoneCall"),                                                                      // 96
            status: "IF",                                                                                              // 97
                                                                                                                       //
            callee_id: Meteor.userId()                                                                                 // 99
        });                                                                                                            // 95
        if (iceFailed) {                                                                                               // 101
            Meteor.VideoCallServices._loadRTCConnection();                                                             // 102
            Meteor.VideoCallServices._setUpCalleeEvents();                                                             // 103
            Meteor.VideoCallServices._setUpMixedEvents();                                                              // 104
            Meteor.VideoCallServices.peerConnection.addStream(Meteor.localStream);                                     // 105
            Meteor.VideoCallServices.VideoChatCallLog.update({                                                         // 106
                _id: Session.get("currentPhoneCall")                                                                   // 107
            }, {                                                                                                       // 106
                $set: {                                                                                                // 109
                    status: "IRS"                                                                                      // 110
                }                                                                                                      // 109
            });                                                                                                        // 108
            Session.set("callState", {                                                                                 // 113
                message: "Ice failed, retrying connection",                                                            // 114
                status: "IRS",                                                                                         // 115
                caller: iceFailed.caller_id,                                                                           // 116
                callee: iceFailed.callee_id,                                                                           // 117
                timestamp: new Date()                                                                                  // 118
            });                                                                                                        // 113
        }                                                                                                              // 120
        var callFailed = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                           // 121
            _id: Session.get("currentPhoneCall"),                                                                      // 122
            status: "F"                                                                                                // 123
        });                                                                                                            // 121
        if (callFailed) {                                                                                              // 125
            Meteor.VideoCallServices.callTerminated();                                                                 // 126
            Session.set("callState", {                                                                                 // 127
                message: "Call failed",                                                                                // 128
                status: "F",                                                                                           // 129
                caller: iceFailed.caller_id,                                                                           // 130
                callee: iceFailed.callee_id,                                                                           // 131
                                                                                                                       //
                timestamp: new Date()                                                                                  // 133
            });                                                                                                        // 127
        }                                                                                                              // 135
        if (Session.get("currentPhoneCall") == null) Meteor.VideoCallServices.callTerminated();                        // 136
    });                                                                                                                // 138
                                                                                                                       //
    /*                                                                                                                 // 140
     *   Read the DDP stream directly to detect changes in state.                                                      //
     *                                                                                                                 //
     */                                                                                                                //
    Meteor.connection._stream.on('message', function (message) {                                                       // 144
        if (Session.get("currentPhoneCall")) {                                                                         // 145
            var currentPhoneCall = Meteor.VideoCallServices.VideoChatCallLog.findOne({                                 // 146
                _id: Session.get("currentPhoneCall")                                                                   // 147
            });                                                                                                        // 146
            var caller = currentPhoneCall.caller_id == Meteor.userId();                                                // 149
            message = JSON.parse(message);                                                                             // 150
            if (message.msg == "changed" && message.collection == "VideoChatCallLog" && message.fields != undefined) {
                if (caller) {                                                                                          // 152
                    console.log("caller", message);                                                                    // 153
                                                                                                                       //
                    if (message.fields.ice_callee != undefined) {                                                      // 155
                        console.log("ice callee", message.fields);                                                     // 156
                        var ice = message.fields.ice_callee;                                                           // 157
                                                                                                                       //
                        Meteor.VideoCallServices.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(ice)), function () {}, function (err) {
                            console.log(err);                                                                          // 168
                        });                                                                                            // 169
                    }                                                                                                  // 172
                                                                                                                       //
                    if (message.fields.SDP_callee != undefined) {                                                      // 174
                        console.log("sdp_callee");                                                                     // 175
                        Meteor.VideoCallServices.peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(message.fields.SDP_callee)), function () {}, function () {});
                    }                                                                                                  // 180
                    if (message.fields.status != undefined) {                                                          // 181
                        if (message.fields.status == currentPhoneCall.callee_id) Meteor.VideoCallServices.callTerminated();
                        if (message.fields.status == "CAN") Meteor.VideoCallServices.callTerminated();                 // 184
                        if (message.fields.status == "A") {                                                            // 186
                            console.log("EY");                                                                         // 187
                            Meteor.VideoCallServices._createLocalOffer();                                              // 188
                            Meteor.VideoCallServices._setUpCallerEvents();                                             // 189
                            Meteor.VideoCallServices._setUpMixedEvents();                                              // 190
                        }                                                                                              // 191
                        if (message.fields.status == "IRS") {                                                          // 192
                            Meteor.VideoCallServices._loadRTCConnection();                                             // 193
                            Meteor.VideoCallServices._createLocalOffer();                                              // 194
                            Meteor.VideoCallServices._setUpCallerEvents();                                             // 195
                            Meteor.VideoCallServices._setUpMixedEvents();                                              // 196
                            Meteor.VideoCallServices.peerConnection.addStream(Meteor.localStream);                     // 197
                        }                                                                                              // 198
                    }                                                                                                  // 199
                } else {                                                                                               // 200
                                                                                                                       //
                    if (message.fields.status != undefined) if (message.fields.status == currentPhoneCall.caller_id) Meteor.VideoCallServices.callTerminated();
                    if (message.fields.SDP_caller != undefined) {                                                      // 206
                        Meteor.VideoCallServices.peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(message.fields.SDP_caller)), function () {
                            Meteor.VideoCallServices.peerConnection.createAnswer(function (answer) {                   // 210
                                Meteor.VideoCallServices.peerConnection.setLocalDescription(answer);                   // 211
                                Meteor.VideoCallServices.VideoChatCallLog.update({                                     // 212
                                    _id: Session.get("currentPhoneCall")                                               // 213
                                }, {                                                                                   // 212
                                    $set: {                                                                            // 215
                                        SDP_callee: JSON.stringify(answer)                                             // 216
                                    }                                                                                  // 215
                                });                                                                                    // 214
                            }, function () {});                                                                        // 219
                        }, function () {});                                                                            // 221
                    }                                                                                                  // 223
                                                                                                                       //
                    if (message.fields.ice_caller != undefined) {                                                      // 225
                        var _ice = message.fields.ice_caller;                                                          // 226
                        console.log("loadingIce", message);                                                            // 227
                        Meteor.VideoCallServices.peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(_ice)), function () {}, function (err) {
                            console.log(err);                                                                          // 229
                        });                                                                                            // 229
                    }                                                                                                  // 231
                }                                                                                                      // 232
            }                                                                                                          // 233
        }                                                                                                              // 234
    });                                                                                                                // 235
};                                                                                                                     // 237
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}},"imports":{"videochat":{"server.js":function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// imports/videochat/server.js                                                                                         //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
VideoCallServices = {                                                                                                  // 1
    VideoChatCallLog: new Meteor.Collection("VideoChatCallLog")                                                        // 2
};                                                                                                                     // 1
/*                                                                                                                     // 4
 *   Allow users to update the connection data collection from the client side                                         //
 *   In a stable release there will be greater control of the people who can edit this.                                //
 *                                                                                                                     //
 */                                                                                                                    //
VideoCallServices.VideoChatCallLog.allow({                                                                             // 9
    update: function () {                                                                                              // 10
        function update(id, originalEntry, fieldBeingUpdated, query) {                                                 // 10
            return Meteor.userId() == originalEntry.callee_id || Meteor.userId() == originalEntry.caller_id;           // 11
        }                                                                                                              // 13
                                                                                                                       //
        return update;                                                                                                 // 10
    }(),                                                                                                               // 10
    insert: function () {                                                                                              // 14
        function insert(id, entry) {                                                                                   // 14
            if (Meteor.user()) {                                                                                       // 15
                var callee = entry.callee_id;                                                                          // 16
                var calleeInCall = VideoCallServices.VideoChatCallLog.findOne({                                        // 17
                    callee_id: callee,                                                                                 // 18
                    status: {                                                                                          // 19
                        $in: ["R", "A", "CON"]                                                                         // 20
                    }                                                                                                  // 19
                });                                                                                                    // 17
                var callMadeButDesposedOf = VideoCallServices.VideoChatCallLog.findOne({                               // 23
                    callee_id: callee,                                                                                 // 24
                    status: "C"                                                                                        // 25
                });                                                                                                    // 23
                if (callMadeButDesposedOf) {                                                                           // 27
                    VideoCallServices.VideoChatCallLog.update({                                                        // 28
                        _id: callMadeButDesposedOf._id                                                                 // 29
                    }, {                                                                                               // 28
                        $set: {                                                                                        // 31
                            status: "F"                                                                                // 32
                        }                                                                                              // 31
                    });                                                                                                // 30
                }                                                                                                      // 35
                if (calleeInCall) {                                                                                    // 36
                    throw new Meteor.Error(500, "Callee is currently in a call");                                      // 37
                    return false;                                                                                      // 38
                } else return true;                                                                                    // 39
            } else return false;                                                                                       // 41
        }                                                                                                              // 43
                                                                                                                       //
        return insert;                                                                                                 // 14
    }()                                                                                                                // 14
});                                                                                                                    // 9
Meteor.users.find({                                                                                                    // 45
    "status.online": true                                                                                              // 46
}).observe({                                                                                                           // 45
    removed: function () {                                                                                             // 48
        function removed(user) {                                                                                       // 48
            VideoCallServices.VideoChatCallLog.find({                                                                  // 49
                $and: [{                                                                                               // 50
                    $or: [{                                                                                            // 51
                        caller_id: user._id                                                                            // 52
                    }, {                                                                                               // 51
                        callee_id: user._id                                                                            // 54
                    }]                                                                                                 // 53
                }, {                                                                                                   // 50
                    $or: [{                                                                                            // 57
                        status: "R"                                                                                    // 58
                    }, {                                                                                               // 57
                        status: "IRS"                                                                                  // 60
                    }, {                                                                                               // 59
                        status: "A"                                                                                    // 62
                    }]                                                                                                 // 61
                }]                                                                                                     // 56
            }).forEach(function (doc) {                                                                                // 49
                VideoCallServices.VideoChatCallLog.update({                                                            // 66
                    _id: doc._id                                                                                       // 67
                }, {                                                                                                   // 66
                    $set: {                                                                                            // 69
                        status: "F"                                                                                    // 70
                    }                                                                                                  // 69
                });                                                                                                    // 68
            });                                                                                                        // 73
            VideoCallServices.VideoChatCallLog.find({                                                                  // 74
                $and: [{                                                                                               // 75
                    $or: [{                                                                                            // 76
                        caller_id: user._id                                                                            // 77
                    }, {                                                                                               // 76
                        callee_id: user._id                                                                            // 79
                    }],                                                                                                // 78
                    status: "CON"                                                                                      // 81
                }]                                                                                                     // 75
            }).forEach(function (doc) {                                                                                // 74
                VideoCallServices.VideoChatCallLog.update({                                                            // 84
                    _id: doc._id                                                                                       // 85
                }, {                                                                                                   // 84
                    $set: {                                                                                            // 87
                        status: "FIN"                                                                                  // 88
                    }                                                                                                  // 87
                });                                                                                                    // 86
            });                                                                                                        // 91
        }                                                                                                              // 92
                                                                                                                       //
        return removed;                                                                                                // 48
    }()                                                                                                                // 48
});                                                                                                                    // 47
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}},"server":{"main.js":["meteor/meteor","../imports/videochat/server.js",function(require,exports,module){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// server/main.js                                                                                                      //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
var Meteor;module.import('meteor/meteor',{"Meteor":function(v){Meteor=v}});module.import('../imports/videochat/server.js');
                                                                                                                       // 2
                                                                                                                       //
Meteor.startup(function () {                                                                                           // 4
  // code to run on server at startup                                                                                  // 5
});                                                                                                                    // 6
                                                                                                                       //
Meteor.methods({                                                                                                       // 9
  "login_record": function () {                                                                                        // 10
    function login_record(username) {                                                                                  // 9
      UserData.insert({                                                                                                // 11
        username: username,                                                                                            // 12
        time: new Date(),                                                                                              // 13
        userData: Meteor.users.findOne({                                                                               // 14
          username: username                                                                                           // 15
        }, {                                                                                                           // 14
          password: 0                                                                                                  // 17
        })                                                                                                             // 16
      });                                                                                                              // 11
    }                                                                                                                  // 20
                                                                                                                       //
    return login_record;                                                                                               // 9
  }()                                                                                                                  // 9
});                                                                                                                    // 9
                                                                                                                       //
UserPresence.onUserOnline(function (userId) {                                                                          // 24
  Meteor.users.update({ _id: userId }, { $set: { status: "online" } });                                                // 25
  console.log(userId + ' online...');                                                                                  // 26
});                                                                                                                    // 27
                                                                                                                       //
UserPresence.onUserIdle(function (userId) {                                                                            // 29
  Meteor.users.update({ _id: userId }, { $set: { status: "idle" } });                                                  // 30
  console.log(userId + ' idle...');                                                                                    // 31
});                                                                                                                    // 32
                                                                                                                       //
UserPresence.onUserOffline(function (userId) {                                                                         // 34
  Meteor.users.update({ _id: userId }, { $set: { status: "offline" } });                                               // 35
  console.log(userId + ' offline...');                                                                                 // 36
});                                                                                                                    // 37
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}]}},{"extensions":[".js",".json"]});
require("./lib/collections.js");
require("./lib/template.js");
require("./server/main.js");
//# sourceMappingURL=app.js.map
