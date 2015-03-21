/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-21
* Time: 02:58 PM
* To change this template use Tools | Templates.
*/

PubSub = {
    debug: false
};

TopicPublishers  = new Mongo.Collection("pubsub.topic.publishers");
TopicSubscribers = new Mongo.Collection("pubsub.topic.subscribers");
Topics           = new Mongo.Collection("pubsub.topics");
Messages         = new Mongo.Collection("pubsub.messages");

MessageSchema = {
    
    //Auto-generated Mongo document _id is used as the message ID
    //_id:    { type: String }, 
    
    header: {
        type: Object
    },
    

    
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    'header.createdAt': {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date};
            } else {
                this.unset();
            }
        }
    },

    'header.createdBy': {
        type: String,
        autoValue: function() {
            if (this.isInsert) {
                return this.userId || 'server';
            } else if (this.isUpsert) {
                return {$setOnInsert: this.userId || 'server'};
            } else {
                this.unset();
            }
        }
    },
    
    
    //These header fields are set by the message publisher/sender
    'header.expiresAt':     { type: Date,    optional: true }, // NOT IN USE: date the message expires.      
    'header.priority':      { type: Number,  optional: true }, // NOT IN USE: priority of this message.      
    'header.correlationID': { type: String,  optional: true }, // NOT IN USE: ID to correlate messages.       
    'header.replyTo':       { type: String,  optional: true }, // NOT IN USE: Where to send message response.
    'header.deliveryMode':  { type: Number,  optional: true }, // NOT IN USE: Need description.              
    
    //These header fields are set by this package
    'header.destination':   { type: String,  optional: true }, //     IN USE: topic channel/collection name
    'header.type':          { type: String,  optional: true }, //     IN USE: topic name (provided in constructor)
    'header.redelivered':   { type: Boolean, optional: true }, // NOT IN USE: Need description.
    
    properties: {
        type: Object,
        optional: true,
        blackbox: true
    },
    
    body: {
        type: Object,
        optional: true,
        blackbox: true
    }
    
    
};
