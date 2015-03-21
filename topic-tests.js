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

    {name: 'WITH message schema & WITH message body & extra property = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World', comment: 'This should not work'}, success: true},

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
    var debug = false;
    SimpleSchema.debug = debug;
    
    var topic = new PubSub.Topic(test.id);
    
    // PRIVATE variables and methods not accessible
    test.isUndefined( topic._self,                "_self should be a private property" );
    test.isUndefined( topic._name,                "_name should be a private property" );
    test.isUndefined( topic._fullname,            "_fullname should be a private property" );
    test.isUndefined( topic._channel,             "_channel should be a private property" );
    test.isUndefined( topic._subscriberFunctions, "_subscriberFunctions should be a private property" );
    
    test.isUndefined( topic._publishToSubscribers );
    
    // PUBLIC methods are accessible and functions
    test.isTrue( _.isFunction(topic.matchesSelector)  ,     "Matches Selector should be a public function" );
    test.isTrue( _.isFunction(topic.checkArchitecture),     "Check Architecture should be a public function" );
    test.isTrue( _.isFunction(topic.getName),               "Get Name should be a public function"  );
    test.isTrue( _.isFunction(topic.getFullName),           "Get Full Name should be a public function"  );
    test.isTrue( _.isFunction(topic.getActiveSubscribers),  "Get Active Subscribers should be a public function"  );
    test.isTrue( _.isFunction(topic.find),                  "Find should be a public function"  );
    test.isTrue( _.isFunction(topic.findOne),               "Find One should be a public function"  );
    test.isTrue( _.isFunction(topic.setSchema),             "Set Schema should be a public function"  );
    test.isTrue( _.isFunction(topic.getSchema),             "Get Schema should be a public function"  );
    test.isTrue( _.isFunction(topic.publish),               "Publish should be a public function"  );
    test.isTrue( _.isFunction(topic.subscribe),             "Subscribe should be a public function"  );
    test.isTrue( _.isFunction(topic.unsubscribe),           "Unsubscribe should be a public function"  );
    
    test.equal(0, topic.getActiveSubscribers().count() );
    
    test.equal(test.id, topic.getName(), "Topic Name should match");
    var name = topic.getName();
    name = "changed";
    test.equal("changed", name);
    test.equal(test.id, topic.getName(), "Topic Name should be unchanged");
    
    
    test.equal("pubsub.topic." + test.id, topic.getFullName(), "Topic Full Name should match");
    var fullname = topic.getFullName();
    fullname = "changed";
    test.equal("changed", fullname);
    test.equal("pubsub.topic." + test.id, topic.getFullName(), "Topic Full Name should be unchanged");
    
    
    test.isFalse( topic.matchesSelector({_id: test.id}),     "No match with undefined selector" );
    test.isFalse( topic.matchesSelector({_id: test.id}, {}), "No match with empty object selector" );
    
    if(Meteor.isServer){
        test.isTrue(  topic.checkArchitecture([]) );
        test.isTrue(  topic.checkArchitecture(["server"]) );
        test.isTrue(  topic.checkArchitecture(["server", "client"]) );
        test.isFalse( topic.checkArchitecture(["client"]) );
        test.isFalse( topic.checkArchitecture(["web.browser"]) );
        test.isFalse( topic.checkArchitecture(["web.cordova"]) );
    }
    
    if(Meteor.isClient){
        test.isTrue(  topic.checkArchitecture([]) );
        test.isFalse( topic.checkArchitecture(["server"]) );
        test.isTrue(  topic.checkArchitecture(["server", "client"]) );
        test.isTrue(  topic.checkArchitecture(["web.browser"]) );
        test.isFalse( topic.checkArchitecture(["web.cordova"]) );
    }
    
    if(Meteor.isCordova){
        test.isTrue(  topic.checkArchitecture([]) );
        test.isFalse( topic.checkArchitecture(["server"]) );
        test.isFalse( topic.checkArchitecture(["server", "client"]) );
        test.isFalse( topic.checkArchitecture(["web.browser"]) );
        test.isTrue(  topic.checkArchitecture(["web.cordova"]) );
    }
                 
});

Tinytest.add('PubSub - Topic Publishing', function(test){
    var debug = false;
    SimpleSchema.debug = debug;
    
    var topic = new PubSub.Topic(test.id);
    
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
                
                testCaseMessage._id = topic.publish(testCaseMessage.body);
                
                if(testCaseMessage.body)
                    test.isTrue( topic.matchesSelector(testCaseMessage, {'body.text': 'Hello World'}) );
                else
                    test.isFalse(topic.matchesSelector(testCaseMessage, {'body.text': 'Hello World'}) );
                
                foundMessage = topic.findOne(testCaseMessage._id);
                
                for(key in foundMessage.body)
                    test.equal(testCaseMessage.body[key], foundMessage.body[key], "Expected values to match for key " + key);
                
            }
            catch(e){
                debug && console.log(e);
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

Tinytest.addAsync('PubSub - Topic Subscribing (No Selector, No Architecture)', function(test, done){
    var debug = false;
    SimpleSchema.debug = debug;
    
    var topic = new PubSub.Topic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    var receivedEvents = [];
    var expectedCalls = _.filter(testCases, function(doc){ return doc.success; }).length;
    
    debug && console.log("expecting " + expectedCalls + " received events");
    
    var subscriber = topic.subscribe(function(userId, message){
        receivedEvents.push(message);
        
        debug && console.log("received " + receivedEvents.length + " events");
        
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
        
        topic.setSchema(testCase.schema ? new SimpleSchema(testCase.schema) : undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
            testCaseMessage._id = topic.publish(testCaseMessage.body);
        }
        catch(e){}
    }
    
});


Tinytest.addAsync('PubSub - Topic Subscribing (With Selector, No Architecture)', function(test, done){
    var debug = false;
    SimpleSchema.debug = debug;
    
    var topic = new PubSub.Topic(test.id);
    
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
            topic.unsubscribe(subscriber);
            test.equal(0, topic.getActiveSubscribers().count() );
            done();
        }
    };
    
    var subscriber = topic.subscribe(fn, {'body.text': 'Hello World'});
    
    test.equal(1, topic.getActiveSubscribers().count() );
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema(testCase.schema ? new SimpleSchema(testCase.schema) : undefined);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
            testCaseMessage._id = topic.publish(testCaseMessage.body);
        }
        catch(e){}
    }
    
});



