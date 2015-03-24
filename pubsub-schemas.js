/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-22
 * Time: 07:23 PM
 * To change this template use Tools | Templates.
 */

/**
 * A static class for storing auto value functions which are used to build SimpleSchema Objects
 * 
 * @class AutoValues
 * @static
 * @private
 */
AutoValues = {};

/**
 * This method is used to automatically set a created at Date value in a SimpleSchema Object
 * 
 * @method createdAtAutoValue
 */
AutoValues.createdAtAutoValue = function() {
    if (this.isInsert) {
        return new Date;
    } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
    } else {
        this.unset();
    }
};

/**
 * This method is used to automatically set a created by String value in a SimpleSchema Object.
 * Created By represents the currently logged in Meteor user or 'server'
 * 
 * @method createdByAutoValue
 */
AutoValues.createdByAutoValue = function() {
    if (this.isInsert) {
        return this.userId || 'server';
    } else if (this.isUpsert) {
        return {$setOnInsert: this.userId || 'server'};
    } else {
        this.unset();
    }
}


/**
 * A static class for storing objects used to build SimpleSchema Objects
 * 
 * @class Schemas
 * @static
 * @private
 */
Schemas = {};


/**
 * This is the base Message Schema used to create a SimpleSchema Object and validate the 
 * structure of a Message before it is inserted into the Messages Collection
 * 
 * @property Message
 * @type Object
 */
Schemas.Message = {
    
    //Auto-generated Mongo document _id is used as the message ID
    //_id:    { type: String }, 
    
    header: {
        type: Object
    },
    
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    'header.createdAt': {
        type: Date,
        autoValue: AutoValues.createdAtAutoValue
    },

    'header.createdBy': {
        type: String,
        autoValue: AutoValues.createdByAutoValue
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

/**
 * This is the Topic Schema used to validate the structure of a Topic before 
 * it is inserted into the Topics Collection
 * 
 * @property Topic
 * @type Object
 */
Schemas.Topic = new SimpleSchema({
    createdAt: {
        type: Date,
        autoValue: AutoValues.createdAtAutoValue
    },
    
    createdBy: {
        type: String,
        autoValue: AutoValues.createdByAutoValue
    },
    
    name: {
        type: String,
        index:  true,
        unique: true
    }
});

/**
 * This is the Topic Subscriber Schema used to validate the structure of a 
 * Topic Subscriber before it is inserted into the TopicSubscribers Collection
 * 
 * @property TopicSubscriber
 * @type Object
 */
Schemas.TopicSubscriber = new SimpleSchema({
    
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    startedAt: {
        type: Date,
        autoValue: AutoValues.createdAtAutoValue
    },

    startedBy: {
        type: String,
        autoValue: AutoValues.createdByAutoValue
    },
    
    stoppedAt: { type: Date, optional: true },
    
    topic:     { type: String, index: true  }, 
    server:    { type: Boolean },
    client:    { type: Boolean },
    cordova:   { type: Boolean },
    selector:  { type: String, optional: true }
    
});