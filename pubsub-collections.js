/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-22
* Time: 07:22 PM
* To change this template use Tools | Templates.
*/

Topics           = new Mongo.Collection("pubsub.topics");

TopicPublishers  = new Mongo.Collection("pubsub.topic.publishers");

TopicSubscribers = new Mongo.Collection("pubsub.topic.subscribers");
SubscriberFunctions = [];

Messages         = new Mongo.Collection("pubsub.messages");

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
Messages.after.insert(function(userId, message){
    check(userId,  Match.Optional(String) );
    check(message, Object);

    
    PubSub.debug && console.log("Message Published");
    PubSub.debug && console.log(PubSub.getActiveSubscribers().count() + " Active Subscriber(s)");
    
    PubSub.getActiveSubscribers().forEach(function(subscriber){
        var selector;
        
        if( Match.test(subscriber.selector, String) ) 
            selector = JSON.parse(subscriber.selector);
        
        var fn = SubscriberFunctions[subscriber._id];
        
        PubSub.debug && console.log("subscriber " + subscriber._id);
        PubSub.debug && console.log("    matches selector -> " + PubSub.matchesSelector(message, selector));
        PubSub.debug && console.log("    check architecture -> " + PubSub.checkArchitecture(subscriber.architecture));
        
        
        if( !Match.test(fn, Function) )
            console.log("ERROR: Could not find a valid function for subscriber " + subscriber._id);
        
        else if(PubSub.matchesSelector(message, selector))
            fn(userId, message);

    });
});