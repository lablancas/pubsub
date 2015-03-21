/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-20
* Time: 02:19 PM
* To change this template use Tools | Templates.
*/

TEST_CASES = [
    {name: 'NO   message schema & NO   message body = SUCCESS', 
     success: true},

    {name: 'WITH message schema & WITH message body & VALID message body schema = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World'}, success: true},

    {name: 'WITH message schema & WITH message body & extra property = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World', comment: 'This should not work'}, success: true},

    //{name: 'WITH message schema & WITH message body & convertible property type = SUCCESS',
    // schema: {text: {type: String}}, body: {text: 1}, success: true},

    {name: 'WITH message schema & NO   message body = ERROR',
     schema: {text: {type: String}}, success: false},

    {name: 'WITH message schema & WITH message body & no properties = ERROR',
     schema: {text: {type: String}}, body: {}, success: false},

    {name: 'WITH message schema & WITH message body & mismatch property type = ERROR',
     schema: {text: {type: String}}, body: {text: ['1', '2']}, success: false},

    {name: 'WITH message schema & WITH message body & missing property = ERROR',
     schema: {text: {type: String}}, body: {comment: 'This should not work'}, success: false}

];

Tinytest.add('PubSub - Topic Constructor', function(test){
    var topic = new Topic(test.id);
    
    // PRIVATE variables and methods not accessible
    test.isUndefined( topic._self );
    test.isUndefined( topic._name );
    test.isUndefined( topic._topic );
    test.isUndefined( topic._subscribers );
    test.isUndefined( topic._subscriberFunctions );
    
    test.isUndefined( topic._publishToSubscribers );
    test.isUndefined( topic.isInSelector );
    test.isUndefined( topic.checkArchitecture );
    
    // PUBLIC methods are accessible and functions
    test.isTrue( _.isFunction(topic.getChannel) );
    test.isTrue( _.isFunction(topic.getName) );
    test.isTrue( _.isFunction(topic.getFullName) );
    
    test.isTrue( _.isFunction(topic.getActiveSubscribers) );
    
    test.isTrue( _.isFunction(topic.find) );
    test.isTrue( _.isFunction(topic.findOne) );
    
    test.isTrue( _.isFunction(topic.setSchema) );
    test.isTrue( _.isFunction(topic.getSchema) );
    
    test.isTrue( _.isFunction(topic.publish) );
    test.isTrue( _.isFunction(topic.subscribe) );
    test.isTrue( _.isFunction(topic.unsubscribe) );
    
    test.equal(0, topic.getActiveSubscribers().count() );
    
    test.equal(test.id, topic.getName());
    test.equal("topic." + test.id, topic.getFullName());
    
});

Tinytest.add('PubSub - Topic Publishing', function(test){
    SimpleSchema.debug = false; //Turn on if need to debug
    
    var topic = new Topic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema(testCase.schema || undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;

        if(testCase.success){
            try{
                
                testCaseMessage._id = topic.publish(testCaseMessage.body);
                foundMessage = topic.findOne(testCaseMessage._id);
                
                for(key in foundMessage.body)
                    test.equal(testCaseMessage.body[key], foundMessage.body[key], "Expected values to match for key " + key);
                
            }
            catch(e){
                console.log(e);
                test.isTrue(false, "Should not see this. No error expected for [" + testCase.name + "]");
            }
        }
        
        else {
            try{
                
                testCaseMessage._id = topic.publish(testCaseMessage.body);
                
                if(Meteor.isClient){
                    foundMessage = topic.findOne(testCaseMessage._id);
                    test.isUndefined(foundMessage, "Should not see this. Failed insert expected for [" + testCase.name + "]");
                }
                    
                else
                    test.isTrue(false, "Should not see this. Error expected for [" + testCase.name + "]");
            }
            catch(e){
                test.isUndefined(testCaseMessage._id);
            }
        }
        
    }
    
    test.equal( topic.find().count(), _.filter(testCases, function(doc){ return doc.success; }).length );
});

Tinytest.addAsync('PubSub - Topic Subscribing', function(test, done){
    var topic = new Topic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    var receivedEvents = [];
    var expectedCalls = _.filter(testCases, function(doc){ return doc.success; }).length;
    
    var subscriber = topic.subscribe(function(userId, message){
        receivedEvents.push(message);
        
        if(receivedEvents.length === expectedCalls){
            topic.unsubscribe(subscriber);
            test.equal(0, topic.getActiveSubscribers().count() );
            done();
        }
    });
    
    test.equal(1, topic.getActiveSubscribers().count() );
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema(testCase.schema || undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
            testCaseMessage._id = topic.publish(testCaseMessage.body);
        }
        catch(e){}
    }
    
});
