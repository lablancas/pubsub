/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-20
* Time: 01:48 PM
* To change this template use Tools | Templates.
*/

TopicPublishers  = new Mongo.Collection("publishers");
TopicSubscribers = new Mongo.Collection("subscribers");
Topics           = new Mongo.Collection("topics");
Messages         = new Mongo.Collection("messages");

Topic = function(name){
    
    var _self = this;
    
    /*****************************************************************************************************
     * 
     * PRIVATE VARIABLES & METHODS
     * 
     * 
     */
    
    check(name, String);
    
    var _name = name;
    var _fullname = "topic." + _name
    var _channel = new Mongo.Collection(_fullname);
    var _subscriberFunctions = {};
    
    /**
     * Publishes a message to all subscribers based on each subscribers selector and architecture.
     * 
     * Arguments:
     * 
     * userId String [Optional]
     * If message was published by a user, the userId; otherwise, undefined
     * 
     * message Object
     * The message document to publish to subscribers
     * 
     */
    var _publishToSubscribers = function(userId, message){
        check(userId,  Match.Optional(String) );
        check(message, Object);
        
        _self.getActiveSubscribers().forEach(function(subscriber){
            if( checkArchitecture(subscriber.architecture) && isInSelector(message, subscriber.selector) ){
                _subscriberFunctions[subscriber._id](userId, message);
            }

        });
    };
    
    
    /**
     * Determines if a doc matches a selector.
     * 
     * Arguments:
     * 
     * message Object
     * The message document to check if it matches with the selector.
     * 
     * selector Mongo Selector, Object ID, or String
     * A query describing the message documents to find
     * 
     */
    var isInSelector = function(message, selector){
        check(message,     Object);
        check(message._id, String);
        check(selector,    Match.Optional(Object));
        
        var s = selector || {};
        s._id = message._id;
        return !_.isUndefined( _channel.findOne(s) );
    };
    
    /**
     * Determines if the current architecture matches. Returns true if matches, false otherwise.
     * 
     * Arguments:
     * 
     * architecture String
     * 'server', 'client', 'web.browser', 'web.cordova'
     * 
     */
    var checkArchitecture = function(architecture){
        check(architecture, Array );
        
        if( architecture.length === 0 )
            return true;
        
        else if(Meteor.isServer && _.contains(architecture, "server") )
            return true;
        
        else if(Meteor.isClient && (_.contains(architecture,"client") || _.contains(architecture,"web.browser") ) )
            return true;
        
        else if(Meteor.isCordova && _.contains(architecture === "web.cordova") )
            return true;
        
        else
            return false;
    };
    
    
    /*****************************************************************************************************
     * 
     * PUBLIC METHODS
     * 
     * 
     */
    
    /**
     * Returns the channel (Mongo.Collection) for storing messages published on this Topic
     */
    _self.getChannel = function(){
        return _channel;
    };
    
    /**
     * Returns the name assigned to this topic. This was provided into the constructor method
     */
    _self.getName = function(){
        return _name;  
    };
    
    /**
     * Returns the full name assigned to this topic. This was derived by the constructor based on the provided name.
     */
    _self.getFullName = function(){
        return _fullname;  
    };
    
    /**
     * Returns the current, active subscribers
     */
    _self.getActiveSubscribers = function(){
        return TopicSubscribers.find({topic: _fullname, stoppedAt: {$exists: false}});  
    };
    
    /**
     * See Mongo.Collection.find
     * http://docs.meteor.com/#/full/find
     */
    _self.find = function(selector, options){
        return _channel.find(selector || {}, options || {});
    };
    
    /**
     * See Mongo.Collection.findOne
     * http://docs.meteor.com/#/full/findone
     */
    _self.findOne = function(selector, options){
        return _channel.findOne(selector || {}, options || {});
    };
    
    /**
     * Sets the Message Body schema for this Topic. Returns void.
     * 
     * schema Object
     * The schema you want to use for the body of a message document. Follow the structure defined by SimpleSchema.
     * 
     * See Collection2 and SimpleSchema
     * 
     * https://atmospherejs.com/aldeed/collection2
     * https://atmospherejs.com/aldeed/simple-schema
     * 
     */
    _self.setSchema = function(schema){
        check(schema, Match.Optional(Object));
        
        var messageSchema = _.clone(MESSAGE_SCHEMA);

        if( !_.isUndefined(schema) ){

            messageSchema.body = {type: Object};

            for(k in schema)
                messageSchema["body." + k] = schema[k];

        }
  
        _channel.attachSchema( new SimpleSchema(messageSchema) , {replace: true});
    };
    
    /**
     * Returns the SimpleSchema Object attached to this Topic.
     * 
     * See Collection2 and SimpleSchema
     * 
     * https://atmospherejs.com/aldeed/collection2
     * https://atmospherejs.com/aldeed/simple-schema
     * 
     */
    _self.getSchema = function(){
        return _channel.simpleSchema();
    };
    
    /**
     * Publish a message on a topic. Returns its unique _id.
     * 
     * Arguments:
     * 
     * messageBody Object
     * The body of the message to publish. May not yet have an _id attribute, in which case Meteor will generate one for you.
     * 
     * callback Function
     * Optional. If present, called with an error object as the first argument and, if no error, the _id as the second.
     */
    _self.publish = function(messageBody, callback){
        check(messageBody, Match.Optional(Object)   );
        check(callback,    Match.Optional(Function) );
        return _channel.insert({ body: _.clone(messageBody) }, callback);
    };
    
    /**
     * Creates a topic subscriber which calls the function defined by the caller. Returns a Subscriber Object.
     * 
     * Arguments:
     * 
     * fn Function
     * Function to call when a message is created on this topic. Called with a userId as the first argument and the message as the second.
     * 
     * selector Mongo Selector, Object ID, or String
     * A query describing the documents to find
     * 
     * architecture String
     * If you only want to enable your subscription on the server (or the client), you can pass in the second argument (e.g., 'server', 'client', 'web.browser', 'web.cordova') to specify where the subscription is enabled.
     * 
     * TODO add subscriber name/id as an input parameter?
     */
    _self.subscribe = function(fn, selector, architecture){
        check(fn,           Function);
        check(selector,     Match.Optional(Object));
        check(architecture, Match.Optional(String));
        
        var subscriber = {topic: _fullname, selector: selector || {}, architecture: architecture || [], startedAt: new Date()};
        subscriber._id = TopicSubscribers.insert(subscriber);

        _subscriberFunctions[subscriber._id] = fn;

        return subscriber;

    };

    /**
     * Removes a topic subscriber
     * 
     * Arguments:
     * subscriber Object
     * The object returned from calling subscribe
     * 
     */
    _self.unsubscribe = function(subscriber){
        check(subscriber,       Object);
        check(subscriber._id,   String);
        check(subscriber.topic, String);
        
        if(subscriber.topic === _fullname){
            TopicSubscribers.update(subscriber._id, {$set: {stoppedAt: new Date()}});
            delete _subscriberFunctions[subscriber._id];
        }
        else{
            throw new Meteor.Error('invalid-subscriber', "Please provide a valid subscriber for topic '" + _fullname + "'.");
        }
    };
    
    
    /*****************************************************************************************************
     * 
     * Constructor
     * 
     * 
     */
    
    // set default message schema
    _self.setSchema();
    
    // clear old subscribers out
    _self.getActiveSubscribers().forEach(_self.unsubscribe);
    
    // create channel after insert event handler
    _channel.after.insert(_publishToSubscribers);
    
};

//TODO ... need to think about how to migrate publish and subscribe methods into these objects... is this needed?

TopicPublisher = function(topic){
    var _topic = topic;

};

TopicSubscriber = function(topic){
    var _topic = topic;
    
};

