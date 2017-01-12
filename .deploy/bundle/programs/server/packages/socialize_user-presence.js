(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MongoInternals = Package.mongo.MongoInternals;
var Mongo = Package.mongo.Mongo;
var _ = Package.underscore._;
var ServerPresence = Package['socialize:server-presence'].ServerPresence;

/* Package-scope variables */
var UserSessions, UserPresence, sessionConnected, sessionDisconnected, userConnected, userDisconnected, determineStatus;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/socialize_user-presence/common/collection.js                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
UserSessions = new Mongo.Collection("presence:user-sessions");

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/socialize_user-presence/server/publications.js                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.publish(null, function(){
    var self = this;
    if(self.userId && self.connection && self.connection.id){
        userConnected(self.connection.id, self.userId, ServerPresence.serverId(), self.connection);
        sessionConnected(self.connection);

        self.onStop(function(){
            userDisconnected(self.connection.id, self.userId, self.connection);
            sessionDisconnected(self.connection);
        });
    }
    self.ready();
}, {is_auto:true});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/socialize_user-presence/server/user-presence.js                                                            //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
UserSessions._ensureIndex({userId:1});
UserSessions._ensureIndex({serverId:1});
UserSessions._ensureIndex({sessionId:1});

var cleanupFunctions = [];
var userOnlineFunctions = [];
var userOfflineFunctions = [];
var userIdleFunctions = [];
var sessionConnectedFunctions = [];
var sessionDisconnectedFunctions = [];

UserPresence = {};

UserPresence.onSessionConnected = function (sessionConnectedFunction){
    if(_.isFunction(sessionConnectedFunction)){
        sessionConnectedFunctions.push(sessionConnectedFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onSessionConnected requires function as parameter");
    }
};

sessionConnected = function(connection) {
    _.each(sessionConnectedFunctions, function(sessionFunction){
        sessionFunction(connection);
    });
};

UserPresence.onSessionDisconnected = function (sessionDisconnectedFunction){
    if(_.isFunction(sessionDisconnectedFunction)){
        sessionDisconnectedFunctions.push(sessionDisconnectedFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onSessionDisconnected requires function as parameter");
    }
};

sessionDisconnected = function(connection) {
    _.each(sessionDisconnectedFunctions, function(sessionFunction){
        sessionFunction(connection);
    });
};


UserPresence.onUserOnline = function(userOnlineFunction) {
    if(_.isFunction(userOnlineFunction)){
        userOnlineFunctions.push(userOnlineFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onUserOnline requires function as parameter");
    }
};

var userOnline = function(userId, connection) {
    _.each(userOnlineFunctions, function(onlineFunction){
        onlineFunction(userId, connection);
    });
};

UserPresence.onUserIdle = function(userIdleFunction) {
    if(_.isFunction(userIdleFunction)){
        userIdleFunctions.push(userIdleFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onUserIdle requires function as parameter");
    }
};

var userIdle = function(userId, connection) {
    _.each(userIdleFunctions, function(idleFunction){
        idleFunction(userId, connection);
    });
};

UserPresence.onUserOffline = function(userOfflineFunction) {
    if(_.isFunction(userOfflineFunction)){
        userOfflineFunctions.push(userOfflineFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onUserOffline requires function as parameter");
    }
};

var userOffline = function(userId, connection) {
    _.each(userOfflineFunctions, function(offlineFunction){
        offlineFunction(userId, connection);
    });
};

UserPresence.onCleanup = function(cleanupFunction){
    if(_.isFunction(cleanupFunction)){
        cleanupFunctions.push(cleanupFunction);
    }else{
        throw new Meteor.Error("Not A Function", "UserPresence.onCleanup requires function as parameter");
    }
};

var cleanup = function() {
    _.each(cleanupFunctions, function(cleanupFunction){
        cleanupFunction();
    });
};

ServerPresence.onCleanup(function(serverId){
    if(serverId){
        UserSessions.find({serverId:serverId}, {fields:{userId:true}}).map(function(session){
            userDisconnected(session._id, session.userId, null);
        });
    }else{
        cleanup();
        UserSessions.remove({});
    }
});

userConnected = function (sessionId, userId, serverId, connection) {
    UserSessions.insert({serverId:serverId, userId:userId, _id:sessionId, status:2});
    determineStatus(userId, connection);
};

userDisconnected = function (sessionId, userId, connection) {
    UserSessions.remove(sessionId);
    determineStatus(userId, connection);
};

determineStatus = function(userId, connection) {
    var status = 0;
    var sessions = UserSessions.find({userId:userId}, {fields:{status:true}});
    var sessionCount = sessions.fetch().length;

    if(sessionCount > 0){
        status = 1;
        sessions.forEach(function(session){
            if(session.status === 2){
                status = 2;
            }
        });
    }

    switch(status){
        case 0:
            userOffline(userId, connection);
            break;
        case 1:
            userIdle(userId, connection);
            break;
        case 2:
            userOnline(userId, connection);
            break;
    }
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/socialize_user-presence/server/server.js                                                                   //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
Meteor.methods({
    updateSessionStatus: function(status){
        if(this.userId && (status === 1 || status === 2)){
            UserSessions.update(this.connection.id, {$set:{status:status}});
            determineStatus(this.userId);
        }
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
(function (pkg, symbols) {
  for (var s in symbols)
    (s in pkg) || (pkg[s] = symbols[s]);
})(Package['socialize:user-presence'] = {}, {
  UserPresence: UserPresence
});

})();
