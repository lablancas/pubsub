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

    {name: 'NO message schema & WITH message body & VALID message body schema = SUCCESS',
     body: {text: 'Hello World'}, success: true},
    
    {name: 'WITH message schema & WITH message body & VALID message body schema = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World'}, success: true},

    {name: 'WITH message schema & WITH message body & extra property = ERROR',
     schema: {text: {type: String}}, body: {text: 'Hello World', comment: 'This should not work'}, success: false},

    {name: 'WITH message schema & NO   message body = ERROR',
     schema: {text: {type: String}}, success: false},
    
    {name: 'WITH message schema & WITH message body & no properties = ERROR',
     schema: {text: {type: String}}, body: {}, success: false},

    {name: 'WITH message schema & WITH message body & mismatch property type = ERROR',
     schema: {text: {type: String}}, body: {text: ['1', '2']}, success: false},

    {name: 'WITH message schema & WITH message body & missing property = ERROR',
     schema: {text: {type: String}}, body: {comment: 'This should not work'}, success: false}

];

cleanup = function(){
    Messages.find().forEach(function(msg){ Messages.remove(msg._id); });
    TopicSubscribers.find().forEach(PubSub.unsubscribe);
};

Tinytest.add('PubSub - Validate Exported Objects', function(test){
    
    test.isTrue( _.isFunction(PubSub.matchesSelector)  ,     "Matches Selector should be a public function" );
    test.isTrue( _.isFunction(PubSub.getActiveSubscribers),  "Get Active Subscribers should be a public function"  );
    test.isTrue( _.isFunction(PubSub.publish),               "Publish should be a public function"  );
    test.isTrue( _.isFunction(PubSub.subscribe),             "Subscribe should be a public function"  );
    test.isTrue( _.isFunction(PubSub.unsubscribe),           "Unsubscribe should be a public function"  );
    
    test.equal(PubSub.getActiveSubscribers().count(), 0 );
        
    test.isFalse( PubSub.matchesSelector({_id: test.id}),     "No match with undefined selector" );
    test.isFalse( PubSub.matchesSelector({_id: test.id}, {}), "No match with empty object selector" );
     
    cleanup();
});

Tinytest.add('PubSub - Topic Constructor', function(test){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    var topic = PubSub.createTopic(test.id);
    
    // PRIVATE variables and methods not accessible
    test.isUndefined( topic._self,                "_self should be a private property" );
    test.isUndefined( topic._name,                "_name should be a private property" );
    test.isUndefined( topic._fullname,            "_fullname should be a private property" );
    
    // PUBLIC methods are accessible and functions
    test.isTrue( _.isFunction(topic.getName),               "Get Name should be a public function"  );
    test.isTrue( _.isFunction(topic.getFullName),           "Get Full Name should be a public function"  );
    
    test.isTrue( _.isFunction(topic.find),                  "Find should be a public function"  );
    test.isTrue( _.isFunction(topic.findOne),               "Find One should be a public function"  );
    test.isTrue( _.isFunction(topic.setSchema),             "Set Schema should be a public function"  );
    test.isTrue( _.isFunction(topic.getSchema),             "Get Schema should be a public function"  );
    
    test.equal(topic.getName(), test.id,  "Topic Name should match");
    var name = topic.getName();
    name = "changed";
    test.equal(name, "changed");
    test.equal(topic.getName(), test.id, "Topic Name should be unchanged");
    
    
    test.equal(topic.getFullName(), "pubsub.topic." + test.id, "Topic Full Name should match");
    var fullname = topic.getFullName();
    fullname = "changed";
    test.equal(fullname, "changed");
    test.equal(topic.getFullName(), "pubsub.topic." + test.id, "Topic Full Name should be unchanged");
       
    cleanup();
});

Tinytest.add('PubSub - Topic Publishing', function(test){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    var topic = PubSub.createTopic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema( testCase.schema ? new SimpleSchema(testCase.schema) : undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;

        if(testCase.success){
            try{
                
                testCaseMessage._id = PubSub.publish(topic, testCaseMessage.body);
                
                if(testCaseMessage.body)
                    test.isTrue( PubSub.matchesSelector(testCaseMessage, {'body.text': 'Hello World'}) );
                else
                    test.isFalse(PubSub.matchesSelector(testCaseMessage, {'body.text': 'Hello World'}) );
                
                foundMessage = topic.findOne(testCaseMessage._id);
                
                for(key in foundMessage.body)
                    test.equal(foundMessage.body[key], testCaseMessage.body[key], "Expected values to match for key " + key);
                
            }
            catch(e){
                debug && console.log(e);
                test.isTrue(false, "Should not see this. No error expected for [" + testCase.name + "]");
            }
        }
        
        else {
            try{
                
                testCaseMessage._id = PubSub.publish(topic, testCaseMessage.body);
                
                if(Meteor.isClient){
                    foundMessage = topic.findOne(testCaseMessage._id);
                    console.log(topic.getSchema());
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
    
    test.equal( _.filter(testCases, function(doc){ return doc.success; }).length, topic.find().count() );
    
    cleanup();
});

Tinytest.addAsync('PubSub - Topic Subscribing (No Selector, No Architecture)', function(test, done){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    var topic = PubSub.createTopic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    var receivedEvents = [];
    var expectedCalls = _.filter(testCases, function(doc){ return doc.success; }).length;
    
    debug && console.log("expecting " + expectedCalls + " received events");
    
    var subscriber = PubSub.subscribe(topic, function(userId, message){
        receivedEvents.push(message);
        
        debug && console.log("received " + receivedEvents.length + " events");
        
        if(receivedEvents.length === expectedCalls){    
            cleanup();
            done();
        }
        
    });
    
    test.equal( PubSub.getActiveSubscribers(topic).count(), 1 );
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema(testCase.schema ? new SimpleSchema(testCase.schema) : undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
            testCaseMessage._id = PubSub.publish(topic, testCaseMessage.body);
        }
        catch(e){}
    }
   
});


Tinytest.addAsync('PubSub - Topic Subscribing (With Selector, No Architecture)', function(test, done){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    var topic = PubSub.createTopic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    var receivedEvents = [];
    var expectedCalls = _.filter(testCases, function(doc){ 
        if(doc.body && doc.body.text)
            return doc.body.text === "Hello World" && doc.success; 
        else
            return false;
    }).length;
    debug && console.log("expecting " + expectedCalls + " received events");
    
    var fn = function(userId, message){
        receivedEvents.push(message);
        
        debug && console.log("received " + receivedEvents.length + " events");
        
        if(receivedEvents.length === expectedCalls){    
            cleanup();
            done();
        }
    };
    
    var subscriber = PubSub.subscribe(topic, fn, {'body.text': 'Hello World'});
    
    test.equal( PubSub.getActiveSubscribers(topic).count(), 1 );
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema(testCase.schema ? new SimpleSchema(testCase.schema) : undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
            testCaseMessage._id = PubSub.publish(topic, testCaseMessage.body);
        }
        catch(e){}
    }
    
});



