/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-21
 * Time: 02:58 PM
 * To change this template use Tools | Templates.
 */

/**
 * Creates a {{#crossLink "Topic"}}{{/crossLink}} Object 
 * 
 * @for PubSub
 * @method createTopic
 * @param name {String} name to assign to the created {{#crossLink "Topic"}}{{/crossLink}}
 * @return {Topic} the created {{#crossLink "Topic"}}{{/crossLink}}
 * 
 */
PubSub.createTopic = function(name){
    return new Topic(name);
};

/**
 * Returns the current, active subscribers
 * 
 * @for PubSub
 * @method getActiveSubscribers
 * @param topic {Topic} [Optional] Used to filter Active Subscribers based on a {{#crossLink "Topic"}}{{/crossLink}}
 * @return Mongo.Cursor A cursor object containing the Topic Subscribers of a Topic or all Topics
 */
PubSub.getActiveSubscribers = function(topic){
    check(topic, Match.Optional(Topic));
    
    var selector = {server:  Meteor.isServer, 
                    client:  Meteor.isClient, 
                    cordova: Meteor.isCordova, 
                    stoppedAt: {$exists: false}}
    
    if(Match.test(topic, Topic))
        selector.topic = topic.getName();
    
    return PubSub.Collections.TopicSubscribers.find(selector);  
};

/**
 * Publish a message on a {{#crossLink "Topic"}}{{/crossLink}}
 * 
 * @for PubSub
 * @method publish
 * @param topic {Topic} Used to define the Topic where you want to publish your message
 * @param message {Object} The message to publish. May not yet have an _id attribute, in which case Meteor will generate one for you.
 * @param callback {Function} [Optional] If present, called with an error object as the first argument and, if no error, the _id as the second.
 * @return {String} the unique ID assigned to your published message if successful
 * 
 * @throws {Error} an object containing the errors found when your message was validated
 * 
 */
PubSub.publish = function(topic, message, callback){
    check(topic,       Topic);
    check(message,     Object);
    check(callback,    Match.Optional(Function) );

    PubSub.debug && console.log("PubSub.publish -> " + JSON.stringify(message) );

    var validator = topic.validate(message);
    
    if(validator.isValid())
        return PubSub.Collections.Messages.insert(message, callback);
    else
        throw validator.getErrorObject(); 
};

/**
 * Creates a topic subscriber which calls the function defined by the caller. Returns a Subscriber Object.
 * 
 * @for PubSub
 * @method subscribe
 * @param topic {Topic} Used to define the Topic where you want to subscribe for messages
 * @param fn {Function} Function to call when a message is created on this topic. Called with a userId as the first argument and the message as the second.
 * @param selector {Object} [Optional] A Mongo Selector used to check the contents of a message to determine if it should be passed to your Function
 * 
 * @return {Object} A Topic Subscriber Object
 */
PubSub.subscribe = function(topic, fn, selector){
    check(topic,        Topic);
    check(fn,           Function);
    check(selector,     Match.Optional(Object));

    var subscriber = {topic: topic.getName(), 
                      server: Meteor.isServer,
                      client: Meteor.isClient,
                      cordova: Meteor.isCordova
                     };
    
    if( Match.test(selector, Object) )
        subscriber.selector = JSON.stringify(selector);
    
    
    subscriber._id = PubSub.Collections.TopicSubscribers.insert(subscriber);
    
    var s = { $and: [{'header.createdAt': {$gte: new Date()}}] };
    if( Match.test(selector, Object) )
        s.$and.push(selector);
    
    PubSub.debug && console.log("PubSub.subscribe: selector -> " + JSON.stringify(s));
    
    if(Meteor.isServer)
         PubSub.Collections.SubscriberFunctions[subscriber._id] = fn;
    else
        PubSub.Collections.SubscriberHandlers[subscriber._id] = topic.find(s).observeChanges({ added: fn });
    
    PubSub.debug && console.log("PubSub.subscribe: subscriber -> " + JSON.stringify(subscriber) );
    
    return subscriber;

};

/**
 * Removes a topic subscriber
 * 
 * @for PubSub
 * @method unsubscribe
 * @param subscriber {Object} The object returned from calling {{#crossLink "PubSub/subscribe:method"}}{{/crossLink}}
 * 
 */
PubSub.unsubscribe = function(subscriber){
    check(subscriber,       Object);
    check(subscriber._id,   String);
    check(subscriber.topic, String);

    PubSub.Collections.TopicSubscribers.update(subscriber._id, {$set: {stoppedAt: new Date()}});
    
    if(Meteor.isServer)
        delete PubSub.Collections.SubscriberFunctions[subscriber._id];
    else{

        var handler = PubSub.Collections.SubscriberHandlers[subscriber._id];

        if( !Match.test(handler, undefined) && Match.test(handler.stop, Function) ){
            console.log("Stopping Observer " + subscriber._id);
            PubSub.Collections.SubscriberHandlers[subscriber._id].stop();
        }
        
        delete PubSub.Collections.SubscriberHandlers[subscriber._id];
    }
    
    PubSub.debug && console.log("PubSub.unsubscribe -> " + JSON.stringify(subscriber) );
    
};

// clear old subscribers out
PubSub.getActiveSubscribers().forEach(PubSub.unsubscribe);


/**
 * Determines if a doc matches a selector.
 * 
 * @for PubSub
 * @method matchesSelector
 * @param message {Object} The message document to check if it matches with the selector.
 * @param selector {Object} A Mongo Selector used to check the contents of the message to determine if the method is a match
 * 
 * @return {Boolean} true if the message is a match to the selector; otherwise, false
 */
PubSub.matchesSelector = function(message, selector){
    check(message,     Object);
    check(message._id, String);
    check(selector,    Match.Optional(Object));

    var s = {$and: [{_id: message._id}]}

    if( Match.test(selector, Object) )
        s.$and.push(selector);

    return Match.test( PubSub.Collections.Messages.findOne(s), Object );
};

