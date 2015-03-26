/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-22
 * Time: 07:22 PM
 * To change this template use Tools | Templates.
 */

/**
 * A static class for storing Mongo.Collection Objects
 * 
 * @class PubSub.Collections
 * @static
 */
PubSub.Collections = {};

/**
 * A Mongo.Collection object for storing Topics
 * 
 * @for PubSub.Collections
 * @property Topics
 * @type     <a href="http://docs.meteor.com/#/full/mongo_collection">Mongo.Collection</a>
 */
PubSub.Collections.Topics           = new Mongo.Collection("pubsub.topics");
PubSub.Collections.Topics.attachSchema(new SimpleSchema(Schemas.Topic));

/**
 * A Mongo.Collection object for storing Topics
 * 
 * @for PubSub.Collections
 * @property TopicPublishers
 * @type     <a href="http://docs.meteor.com/#/full/mongo_collection">Mongo.Collection</a>
 */
PubSub.Collections.TopicPublishers  = new Mongo.Collection("pubsub.topic.publishers");

/**
 * A Mongo.Collection object for storing Topic Subscribers
 * 
 * @for PubSub.Collections
 * @property TopicSubscribers
 * @type     <a href="http://docs.meteor.com/#/full/mongo_collection">Mongo.Collection</a>
 */
PubSub.Collections.TopicSubscribers = new Mongo.Collection("pubsub.topic.subscribers");
PubSub.Collections.TopicSubscribers.attachSchema(new SimpleSchema(Schemas.TopicSubscriber));

/**
 * An Array for storing Subscription Handlers
 * 
 * @for PubSub.Collections
 * @property SubscriberFunctions
 * @type     Array
 */
PubSub.Collections.SubscriberFunctions = [];

/**
 * An Array for storing Observer Handlers
 * 
 * @for PubSub.Collections
 * @property SubscriberHandlers
 * @type     Array
 */
PubSub.Collections.SubscriberHandlers = [];

/**
 * A Mongo.Collection object for storing Messages
 * 
 * @for PubSub.Collections
 * @property Messages
 * @type     <a href="http://docs.meteor.com/#/full/mongo_collection">Mongo.Collection</a>
 */
PubSub.Collections.Messages         = new Mongo.Collection("pubsub.messages");
PubSub.Collections.Messages.attachSchema(new SimpleSchema(Schemas.Message));

/*
 * Publishes a message to all subscribers based on each subscribers selector and architecture.
 * 
 */
if(Meteor.isServer){
    PubSub.Collections.Messages.after.insert(function(userId, message){
        check(userId,  Match.Optional(String) );
        check(message, Object);


        PubSub.debug && console.log("Message Published");
        PubSub.debug && console.log(PubSub.getActiveSubscribers().count() + " Active Subscriber(s)");

        PubSub.getActiveSubscribers().forEach(function(subscriber){
            var selector;

            if( Match.test(subscriber.selector, String) ) 
                selector = JSON.parse(subscriber.selector);

            var fn = PubSub.Collections.SubscriberFunctions[subscriber._id];

            PubSub.debug && console.log("subscriber " + subscriber._id);
            PubSub.debug && console.log("    matches selector -> " + PubSub.matchesSelector(message, selector));
            PubSub.debug && console.log("    check architecture -> " + PubSub.checkArchitecture(subscriber.architecture));


            if( !Match.test(fn, Function) )
                console.log("ERROR: Could not find a valid function for subscriber " + subscriber._id);

            else if(PubSub.matchesSelector(message, selector))
                fn(userId, message);

        });
    });
}