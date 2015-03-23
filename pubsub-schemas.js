/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-22
* Time: 07:23 PM
* To change this template use Tools | Templates.
*/

createdAtAutoValue = function() {
    if (this.isInsert) {
        return new Date;
    } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
    } else {
        this.unset();
    }
};

createdByAutoValue = function() {
    if (this.isInsert) {
        return this.userId || 'server';
    } else if (this.isUpsert) {
        return {$setOnInsert: this.userId || 'server'};
    } else {
        this.unset();
    }
}

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
        autoValue: createdAtAutoValue
    },

    'header.createdBy': {
        type: String,
        autoValue: createdByAutoValue
    },
    
    //These header fields are set by the message publisher/sender
    'header.expiresAt':     { type: Date,    optional: true }, // NOT IN USE: date the message expires.      
    'header.priority':      { type: Number,  optional: true }, // NOT IN USE: priority of this message.      
    'header.correlationID': { type: String,  optional: true }, // NOT IN USE: ID to correlate messages.       
    'header.replyTo':       { type: String,  optional: true }, // NOT IN USE: Where to send message response.
    'header.deliveryMode':  { type: Number,  optional: true }, // NOT IN USE: Need description.              
    
    //These header fields are set by this package
    'header.destination':   { type: String,  index: true    }, //     IN USE: topic name
    'header.type':          { type: String,  optional: true }, // NOT IN USE: Need description.
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

TopicSchema = new SimpleSchema({
    createdAt: {
        type: Date,
        autoValue: createdAtAutoValue
    },
    
    createdBy: {
        type: String,
        autoValue: createdByAutoValue
    },
    
    name: {
        type: String,
        index:  true,
        unique: true
    }
});

TopicSubscriberSchema = new SimpleSchema({
    
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    startedAt: {
        type: Date,
        autoValue: createdAtAutoValue
    },

    startedBy: {
        type: String,
        autoValue: createdByAutoValue
    },
    
    stoppedAt: { type: Date, optional: true },
    
    topic:     { type: String, index: true  }, 
    server:    { type: Boolean },
    client:    { type: Boolean },
    cordova:   { type: Boolean },
    selector:  { type: String, optional: true }
    
});