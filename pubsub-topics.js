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
    
    var _name = name;
    var _fullname = "pubsub.topic." + _name;
    var _schema;
    
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
        return _name;  
    };
    
    /**
     * Returns the full name assigned to this topic. This was derived by the constructor based on the provided name.
     */
    _self.getFullName = function(){
        return _fullname;  
    };

    
    /**
     * See Mongo.Collection.find
     * http://docs.meteor.com/#/full/find
     */
    _self.find = function(selector, options){
        var s = { $and: [{'header.destination': _self.getFullName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
        return Messages.find(s, options);
    };
    
    /**
     * See Mongo.Collection.findOne
     * http://docs.meteor.com/#/full/findone
     */
    _self.findOne = function(selector, options){
        var s = { $and: [{'header.destination': _self.getFullName()}] };
        
        if( Match.test(selector, Object) )
            s.$and.push(selector);
        
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
        var messageSchema = _.clone(MessageSchema);

        if( !Match.test(schema, undefined) )
            messageSchema.body = {type: schema};
  
        _schema = new SimpleSchema(messageSchema);
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
        return _schema;
    };
    
    
    /*****************************************************************************************************
     * 
     * Constructor
     * 
     * 
     */
    
    // set default message schema
    _self.setSchema();
    
};


