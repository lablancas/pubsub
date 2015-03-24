/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-20
 * Time: 01:48 PM
 * To change this template use Tools | Templates.
 */

/**
 * A Topic provides the needed information to determine how to publish a message, how to validate the
 * structure of a message for this Topic, and a means to find messages for this Topic.
 * 
 * @class Topic
 * @constructor
 * @param name {String} the name to be assigned to this Topic
 */
Topic = function(name){
    
    check(name, String);
    
    var _self = this;
    
    /*
     ***************************************************************************************************** 
     * PRIVATE VARIABLES & METHODS
     * 
     * 
     */
    
    /**
     * Contains the name and JSON stringified version of the message schema
     * 
     * @property _topic 
     * @type Object
     * @private
     */
    var _topic = PubSub.Collections.Topics.findOne({name: name});
    
    if(Match.test(_topic, undefined)){
        _topic = {
            name: name,
            schema: JSON.stringify(Schemas.Message)
        };
        
        _topic._id = PubSub.Collections.Topics.insert(_topic);
    }
    
    /*
     ***************************************************************************************************** 
     * PUBLIC METHODS
     * 
     * 
     */
    
    /**
     * Returns the name assigned to this topic. This was provided into the constructor method
     * 
     * @method getName
     * @return {String} the name assigned to this Topic
     */
    _self.getName = function(){
        return _topic.name;  
    };
    
    /**
     * See Mongo.Collection.find http://docs.meteor.com/#/full/find
     * 
     * @method find
     * @param selector {Object} [Optional] See MongoDB Selector
     * @param options  {Object} [Optional] See MongoDB Selector Options
     * @return {Mongo.Cursor} A cursor object containing the Topic messages matching your request
     */
    _self.find = function(selector, options){
        check(selector, Match.OneOf(Object, String, undefined));
        check(options, Match.OneOf(Object, undefined));
        
        var s = { $and: [{'header.destination': _self.getName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
        else if ( Match.test(selector, String) )
            s.$and.push({_id: selector});
        
        return PubSub.Collections.Messages.find(s, options);
    };
    
    /**
     * See Mongo.Collection.findOne http://docs.meteor.com/#/full/findone
     * 
     * @method findOne
     * @param selector {Object} [Optional] See MongoDB Selector
     * @param options  {Object} [Optional] See MongoDB Selector Options
     * @return {Object} The first object containing the Topic message matching your request
     */
    _self.findOne = function(selector, options){
        check(selector, Match.OneOf(Object, String, undefined));
        check(options, Match.OneOf(Object, undefined));
        
        var s = { $and: [{'header.destination': _self.getName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
        else if ( Match.test(selector, String) )
            s.$and.push({_id: selector});
        
        return PubSub.Collections.Messages.findOne(s, options);
    };
    
    /**
     * Sets the Message Body schema for this Topic. Returns void.
     * 
     * @method setSchema
     * @param schema {SimpleSchema}
     * [Optional] The schema you want to use for the body of a message document.
     * 
     */
    _self.setSchema = function(schema){
        check(schema, Match.Optional(SimpleSchema));
        var messageSchema = _.clone(Schemas.Message);

        if( Match.test(schema, SimpleSchema) )
            messageSchema.body = {type: schema};
        
        PubSub.debug && console.log("Topic.setSchema -> " + JSON.stringify(messageSchema) );
        
        _topic.schema = new SimpleSchema( messageSchema );
    };
    
    /**
     * Returns the SimpleSchema Object attached to this Topic.
     * 
     * @method getSchema
     * @return {SimpleSchema} The SimpleSchema Object used to validate messages for this Topic
     * 
     */
    _self.getSchema = function(){
        return _topic.schema;
    };
    
    
     
    /**
     * Creates a message object for you to publish and/or validate.
     * 
     * @method createMessage
     * @param messageBody {Object} [Optional] The body of the message you would like to publish.
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
     * Checks if your message is valid and returns a SimpleSchemaValidationContext after the message has been validated
     * 
     * @method validate
     * @param message {Object} The message you would like to publish. See {{#crossLink "Topic/createMessage:method"}}{{/crossLink}}
     * 
     * @return {SimpleSchemaValidationContext}
     */
    _self.validate = function(message){
        check(message, Object);
        var validator = _self.getSchema().newContext();
        
        validator.validate(message);

        return validator;
    };
    
    // INITIALIZE Topic Schema
    _self.setSchema();
};


