/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-20
* Time: 01:48 PM
* To change this template use Tools | Templates.
*/

Topic = function(name){
    
    var _self = this;
    
    /*****************************************************************************************************
     * 
     * PRIVATE VARIABLES & METHODS
     * 
     * 
     */
    
    check(name, String);
    
    var _topic = Topics.findOne({name: name});
    
    if(Match.test(_topic, undefined)){
        _topic = {
            name: name,
            schema: JSON.stringify(MessageSchema)
        };
        
        _topic._id = Topics.insert(_topic);
    }
    
    
    /*****************************************************************************************************
     * 
     * PUBLIC METHODS
     * 
     * 
     */
    
    /**
     * Returns the name assigned to this topic. This was provided into the constructor method
     */
    _self.getName = function(){
        return _topic.name;  
    };
    
    /**
     * See Mongo.Collection.find
     * http://docs.meteor.com/#/full/find
     */
    _self.find = function(selector, options){
        check(selector, Match.OneOf(Object, String, undefined));
        check(options, Match.OneOf(Object, undefined));
        
        var s = { $and: [{'header.destination': _self.getName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
        else if ( Match.test(selector, String) )
            s.$and.push({_id: selector});
        
        return Messages.find(s, options);
    };
    
    /**
     * See Mongo.Collection.findOne
     * http://docs.meteor.com/#/full/findone
     */
    _self.findOne = function(selector, options){
        check(selector, Match.OneOf(Object, String, undefined));
        check(options, Match.OneOf(Object, undefined));
        
        var s = { $and: [{'header.destination': _self.getName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
        else if ( Match.test(selector, String) )
            s.$and.push({_id: selector});
        
        return Messages.findOne(s, options);
    };
    
    /**
     * Sets the Message Body schema for this Topic. Returns void.
     * 
     * schema Object
     * The schema you want to use for the body of a message document. 
     * This object will be assigned as the type value of the message 
     * body so you can use a Javascript Object including a SimpleSchema 
     * Object (see https://github.com/aldeed/meteor-simple-schema#schema-rules).
     * 
     * See Collection2 and SimpleSchema
     * 
     * https://atmospherejs.com/aldeed/collection2
     * https://atmospherejs.com/aldeed/simple-schema
     * 
     */
    _self.setSchema = function(schema){
        check(schema, Match.Optional(SimpleSchema));
        var messageSchema = _.clone(MessageSchema);

        if( Match.test(schema, SimpleSchema) )
            messageSchema.body = {type: schema};
        
        PubSub.debug && console.log("Topic.setSchema -> " + JSON.stringify(messageSchema) );
        
        _topic.schema = new SimpleSchema( messageSchema );
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
        return _topic.schema;
    };
    
    
     
    /**
     * Creates a message object for you to publish and/or validate.
     * 
     * Arguments:
     * 
     * messageBody Object
     * The body of the message you would like to publish.
     * 
     */
    _self.createMessage = function(messageBody){
        check(messageBody, Match.Optional(Object));

        var message = { header: {createdAt: new Date(), 
                                 createdBy: 'placeholder', 
                                 destination: _self.getName()
                                }
                      };

        if( Match.test(messageBody, Object) )
            message.body = _.clone(messageBody);

        return message;
    }
    
    /**
     * Checks if your message is valid and returns a Simple Schema Validation Context after the message has been validated
     * 
     * Arguments:
     * 
     * message Object
     * The message you would like to publish. See Topic.createMessage
     * 
     */
    _self.validate = function(message){
        check(message, Object);
        var validator = _self.getSchema().newContext();
        
        validator.validate(message);

        return validator;
    };
    
    
    /**
     * Constructor
     */
    _self.setSchema();
};


