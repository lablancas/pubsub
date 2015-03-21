# SUMMARY

This package provides the capability of defining a Topic for publishing messages.

A message can be an unstructure or structure JSON document.  You decide for each Topic.A

Topic's provide 
* the capability of publishing messages and validating their structure
* the capability to define event handlers that are called when a message is published on the Topic


# FUNCTIONS

#### new Topic(name)
Creates a new Topic to store messages under your chosen name. 

*name* String
The unique name you want to give to your topic for publishing messages

#### getChannel()
Returns the channel (Mongo.Collection) for storing messages published on this Topic

#### getName()
Returns the name assigned to this topic. This was provided into the constructor method

#### getFullName()
Returns the full name assigned to this topic. This was derived by the constructor based on the provided name.

#### getActiveSubscribers()
Returns the current, active subscribers

#### find(selector, options)
See Mongo.Collection.find
http://docs.meteor.com/#/full/find

#### findOne(selector, options)
See Mongo.Collection.find
http://docs.meteor.com/#/full/findone

#### setSchema(schema)
Sets the Message Body schema for this Topic. Returns void.

*schema* Object
The schema you want to use for the body of a message document. Follow the structure defined by SimpleSchema.

See Collection2 and SimpleSchema

https://atmospherejs.com/aldeed/collection2
https://atmospherejs.com/aldeed/simple-schema


#### getSchema()
Returns the SimpleSchema Object attached to this Topic.

See Collection2 and SimpleSchema

https://atmospherejs.com/aldeed/collection2
https://atmospherejs.com/aldeed/simple-schema

#### publish(messageBody, callback)
Publish a message on a topic. Returns its unique _id.

###### Arguments

*messageBody* Object
The body of the message to publish. May not yet have an _id attribute, in which case Meteor will generate one for you.

*callback* Function
Optional. If present, called with an error object as the first argument and, if no error, the _id as the second.

#### subscribe(fn, selector, architecture)    
Creates a topic subscriber which calls the function defined by the caller. Returns a Subscriber Object.

###### Arguments
*fn* Function
Function to call when a message is created on this topic. Called with a userId as the first argument and the message as the second.

*selector* Mongo Selector, Object ID, or String
A query describing the documents to find

*architecture* String
If you only want to enable your subscription on the server (or the client), you can pass in the second argument (e.g., 'server', 'client', 'web.browser', 'web.cordova') to specify where the subscription is enabled.

TODO add subscriber name/id as an input parameter?

#### unsubscribe(subscriber)
Removes a topic subscriber

###### Arguments
*subscriber* Object
The object returned from calling subscribe
