/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-21
* Time: 02:58 PM
* To change this template use Tools | Templates.
*/

/** 
  * This package provides the capability of defining a Topic for publishing messages.
  * 
  * A message can be an unstructure or structure JSON document.  You decide for each Topic.
  * 
  * A Topic provides
  *   > the capability of publishing messages and validating their structure
  *   > the capability to define event handlers that are called when a message is published on the Topic
  */ 
PubSub = {
    debug: false
};


PubSub.createTopic = function(name){
    return new Topic(name);
};

/**
 * Returns the current, active subscribers
 * 
  * Arguments:
  * 
  * topic Topic
  * Optional. Used to filter Active Subscribers based on Topic
 */
PubSub.getActiveSubscribers = function(topic){
    check(topic, Match.Optional(Topic));
    
    var selector = {server:  Meteor.isServer, 
                    client:  Meteor.isClient, 
                    cordova: Meteor.isCordova, 
                    stoppedAt: {$exists: false}}
    
    if(Match.test(topic, Topic))
        selector.topic = topic.getFullName();
    
    return TopicSubscribers.find(selector);  
};

/**
  * Publish a message on a topic. Returns its unique _id.
  * 
  * Arguments:
  * 
  * topic Topic
  * Used to define the Topic where you want to publish your message
  * 
  * messageBody Object
  * The body of the message to publish. May not yet have an _id attribute, in which case Meteor will generate one for you.
  * 
  * callback Function
  * Optional. If present, called with an error object as the first argument and, if no error, the _id as the second.
  */
PubSub.publish = function(topic, messageBody, callback){
    check(topic,       Topic);
    check(messageBody, Match.Optional(Object)   );
    check(callback,    Match.Optional(Function) );


    var message = { header: {createdAt: new Date(), 
                             createdBy: 'placeholder', 
                             destination: topic.getFullName(), 
                             type: topic.getName() }
                  };
    
    if( Match.test(messageBody, Object) )
        message.body = _.clone(messageBody);

    var validator = topic.getSchema().newContext();
    
    //NOTE: would rather use topic.getSchema().clean(message), but doesn't work as documented
    if(validator.validate(message))
        return Messages.insert(message, callback);
    else
        throw validator.getErrorObject(); 
};

/**
  * Creates a topic subscriber which calls the function defined by the caller. Returns a Subscriber Object.
  * 
  * Arguments:
  * 
  * topic Topic
  * Used to define the Topic where you want to subscribe for messages
  * 
  * fn Function
  * Function to call when a message is created on this topic. Called with a userId as the first argument and the message as the second.
  * 
  * selector Mongo Selector, Object ID, or String
  * A query describing the documents to find
  * 
  */
PubSub.subscribe = function(topic, fn, selector){
    check(topic,        Topic);
    check(fn,           Function);
    check(selector,     Match.Optional(Object));

    var subscriber = {topic: topic.getFullName(), 
                      startedAt: new Date(),
                      server: Meteor.isServer,
                      client: Meteor.isClient,
                      cordova: Meteor.isCordova
                     };
    
    if( Match.test(selector, Object) )
        subscriber.selector = JSON.stringify(selector);
    
    subscriber._id = TopicSubscribers.insert(subscriber);

    SubscriberFunctions[subscriber._id] = fn;

    PubSub.debug && console.log("Adding subscriber " + subscriber._id);
    PubSub.debug && console.log(subscriber);
    
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
PubSub.unsubscribe = function(subscriber){
    check(subscriber,       Object);
    check(subscriber._id,   String);
    check(subscriber.topic, String);

    TopicSubscribers.update(subscriber._id, {$set: {stoppedAt: new Date()}});
    delete SubscriberFunctions[subscriber._id];
    
    PubSub.debug && console.log("Deleted subscriber " + subscriber._id);
    PubSub.debug && console.log(subscriber);
    
};

// clear old subscribers out
PubSub.getActiveSubscribers().forEach(PubSub.unsubscribe);


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
PubSub.matchesSelector = function(message, selector){
    check(message,     Object);
    check(message._id, String);
    check(selector,    Match.Optional(Object));

    var s = {$and: [{_id: message._id}]}

    if( Match.test(selector, Object) )
        s.$and.push(selector);

    return Match.test( Messages.findOne(s), Object );
};

