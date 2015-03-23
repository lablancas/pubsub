[![Build Status](https://travis-ci.org/lablancas/pubsub.svg)](https://travis-ci.org/lablancas/pubsub)

# Publish/Subscribe Messaging

This package provides the capability of defining a Topic for publishing messages.

A message can be an unstructure or structure JSON document.  You decide for each Topic.

Topic's provide 
* the capability of publishing messages and validating their structure
* the capability to define event handlers that are called when a message is published on the Topic

## PubSub Object

### PubSub.createTopic(name)
Creates a new Topic to store messages under your chosen name. 

##### Arguments
*name* String
The unique name you want to give to your topic for publishing messages

### PubSub.publish(topic, messageBody, callback)
Publish a message on a topic. Returns its unique _id.

##### Arguments
*topic* Topic
Used to define the Topic where you want to publish your message

*messageBody* Object
The body of the message to publish. May not yet have an _id attribute, in which case Meteor will generate one for you.

*callback* Function
Optional. If present, called with an error object as the first argument and, if no error, the _id as the second.

### PubSub.subscribe(topic, fn, selector)    
Creates a topic subscriber which calls the function defined by the caller. Returns a Subscriber Object.

##### Arguments
*topic* Topic
Used to define the Topic where you want to subscribe for messages

*fn* Function
Function to call when a message is created on this topic. Called with a userId as the first argument and the message as the second.

*selector* Mongo Selector, Object ID, or String
A query describing the documents to find

### PubSub.unsubscribe(subscriber)
Removes a topic subscriber

##### Arguments
*subscriber* Object
The object returned from calling subscribe

### PubSub.getActiveSubscribers(topic)
Returns the current, active subscribers

##### Arguments
*topic* Topic
Optional. Used to filter Active Subscribers based on Topic

### PubSub.matchesSelector(message, selector)
Determines if a doc matches a selector. Returns true if matches; otherwise, false

##### Arguments

*message* Object
The message document to check if it matches with the selector

*selector* Mongo Selector, Object ID, or String
A query describing the message documents to find


## Topics

### Topic.getName()
Returns the name assigned to this topic. This was provided into the constructor method

### Topic.getFullName()
Returns the full name assigned to this topic. This was derived by the constructor based on the provided name.

### Topic.find(selector, options)
Returns a Mongo.Cursor containing the messages in this Topic that match your selector and options. (see http://docs.meteor.com/#/full/find)

### Topic.findOne(selector, options)
Returns the first message object from this Topic matching your selector and options (see http://docs.meteor.com/#/full/findone)

### Topic.setSchema(schema)
Sets the Message Body schema for this Topic. Returns void.

##### Arguments
*schema* Object
The schema you want to use for the body of a message document. This object will be assigned as the type value of the message body so you can use a Javascript Object including a SimpleSchema Object (see https://github.com/aldeed/meteor-simple-schema#schema-rules).

### Topic.getSchema()
Returns the SimpleSchema Object attached to this Topic (see https://github.com/aldeed/meteor-collection2/#schema-format)
