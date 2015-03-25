/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-20
 * Time: 02:19 PM
 * To change this template use Tools | Templates.
 */

TEST_CASES = [
    {name: 'NO   message schema & NO   message body = SUCCESS', 
     success: true},

    {name: 'NO message schema & WITH message body = SUCCESS',
     body: {text: 'Hello World'}, success: true},
    
    /*
     * FIXME issue where cannot specify message body schema type as primitive javascript object (e.g. String, Number, Date) 
     * 
    {name: 'WITH message schema & WITH message body (String) & VALID message body schema = SUCCESS',
     schema: String, body: 'Live Testing of Body as a String', success: true},
    
    {name: 'WITH message schema & WITH message body (Number) & VALID message body schema = SUCCESS',
     schema: Number, body: 12345, success: true},
    
    {name: 'WITH message schema & WITH message body (Date) & VALID message body schema = SUCCESS',
     schema: Date, body: new Date(), success: true},
    */
    
    {name: 'WITH message schema & WITH message body (Object) & VALID message body schema = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World'}, success: true},

    {name: 'WITH message schema & WITH message body & extra property = SUCCESS',
     schema: {text: {type: String}}, body: {text: 'Hello World', comment: 'This should be filtered out'}, success: true},

    {name: 'WITH message schema & NO   message body = ERROR',
     schema: {text: {type: String}}, success: false},
    
    {name: 'WITH message schema & WITH message body & no properties = ERROR',
     schema: {text: {type: String}}, body: {}, success: false},

    {name: 'WITH message schema & WITH message body & mismatch property type = ERROR',
     schema: {text: {type: String}}, body: {text: ['1', '2']}, success: false},

    {name: 'WITH message schema & WITH message body & missing property = ERROR',
     schema: {text: {type: String}}, body: {comment: 'This should not work'}, success: false}

];

login = function(){
    // setup
    this.username = Random.id();
    this.email = Random.id() + '-intercept@example.com';
    this.password = 'password';

    Accounts.createUser({username: this.username, email: this.email, password: this.password});
    Meteor.loginWithPassword(this.username, this.password);
};

cleanup = function(){
    PubSub.Collections.Messages.find().forEach(function(msg){ PubSub.Collections.Messages.remove(msg._id); });
    PubSub.Collections.TopicSubscribers.find().forEach(PubSub.unsubscribe);
    PubSub.Collections.Topics.find().forEach(function(doc){ PubSub.Collections.Topics.remove(doc._id); });
};

Tinytest.add('PubSub - Validate Exported Objects', function(test){
    if(Meteor.isClient) login();
    
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
    
    if(Meteor.isClient) login();
    
    var topic = PubSub.createTopic(test.id);
    
    // PRIVATE variables and methods not accessible
    test.isUndefined( topic._self,                "_self should be a private property" );
    test.isUndefined( topic._name,                "_name should be a private property" );
    test.isUndefined( topic._fullname,            "_fullname should be a private property" );
    
    // PUBLIC methods are accessible and functions
    test.isTrue( _.isFunction(topic.getName),               "Get Name should be a public function"  );
    
    test.isTrue( _.isFunction(topic.find),                  "Find should be a public function"  );
    test.isTrue( _.isFunction(topic.findOne),               "Find One should be a public function"  );
    test.isTrue( _.isFunction(topic.setSchema),             "Set Schema should be a public function"  );
    test.isTrue( _.isFunction(topic.getSchema),             "Get Schema should be a public function"  );
    
    test.equal(topic.getName(), test.id,  "Topic Name should match");
    var name = topic.getName();
    name = "changed";
    test.equal(name, "changed");
    test.equal(topic.getName(), test.id, "Topic Name should be unchanged");
    
    cleanup();
});

Tinytest.add('PubSub - Topic Publishing', function(test){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    if(Meteor.isClient) login();
    
    var topic = PubSub.createTopic(test.id);
    
    debug && console.log( PubSub.Collections.Topics.findOne({name: test.id}) );
    
    var testCases = _.clone(TEST_CASES);
    
    for(i=0; i < testCases.length; i++){
        var testCaseLogPrefix = "Test Case #" + i + ": ";
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema( Match.test(testCase.schema, Object) ? new SimpleSchema(testCase.schema) : testCase.schema);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;

        if(testCase.success){
            try{
                debug && console.log(testCaseLogPrefix + "before publishing: " + JSON.stringify(testCaseMessage) );
                
                testCaseMessage = topic.createMessage(testCaseMessage.body);
                testCaseMessage._id = PubSub.publish(topic, testCaseMessage);
                
                if(testCaseMessage.body && testCaseMessage.body.text)
                    test.isTrue( PubSub.matchesSelector(testCaseMessage, {'body.text': 'Hello World'}) );
                
                debug && console.log(testCaseLogPrefix + "after publishing: " + JSON.stringify(testCaseMessage) );
                
                
                foundMessage = topic.findOne(testCaseMessage._id);
                debug && console.log(testCaseLogPrefix + "foundMessage -> " + JSON.stringify(foundMessage) );
                test.equal(foundMessage.body, testCaseMessage.body, testCaseLogPrefix + "Expected body of messages to match");
                
            }
            catch(e){
                debug && console.log(e);
                test.isTrue(false, testCaseLogPrefix + "Should not see this. No error expected for [" + testCase.name + "]");
            }
        }
        
        else {
            try{
                
                testCaseMessage = topic.createMessage(testCaseMessage.body);
                testCaseMessage._id = PubSub.publish(topic, testCaseMessage);
                
                if(Meteor.isClient){
                    foundMessage = topic.findOne(testCaseMessage._id);
                    console.log(topic.getSchema());
                    test.isUndefined(foundMessage, testCaseLogPrefix + "Should not see this. Failed insert expected for [" + testCase.name + "]");
                }
                    
                else
                    test.isTrue(false, testCaseLogPrefix + "Should not see this. Error expected for [" + testCase.name + "]");
            }
            catch(e){
                test.isUndefined(testCaseMessage._id);
            }
        }
        
    }
    
    test.equal( topic.find().count(), _.filter(testCases, function(doc){ return doc.success; }).length );
    
    cleanup();
});

Tinytest.addAsync('PubSub - Topic Subscribing', function(test, done){
    var debug = false;
    PubSub.debug = debug;
    SimpleSchema.debug = debug;
    
    if(Meteor.isClient) login();
    
    var topic = PubSub.createTopic(test.id);
    
    var testCases = _.clone(TEST_CASES);
    
    //NO Selector Variables
    var receivedEventsNoSelector = [];
    var expectedCallsNoSelector = _.filter(testCases, function(doc){ return doc.success; }).length;
    var noSelectorDone = false;
    
    //WITH Selector Variables
    var receivedEventsWithSelector = [];
    var expectedCallsWithSelector = _.filter(testCases, function(doc){ 
        if(doc.body && doc.body.text)
            return doc.body.text === "Hello World" && doc.success; 
        else
            return false;
    }).length;
    var withSelectorDone = false;
    
    //Start NO Selector Subscriber
    var subscriberNoSelector = PubSub.subscribe(topic, function(userId, message){
        receivedEventsNoSelector.push(message);
        
        debug && console.log("No Selector: received " + receivedEventsNoSelector.length + " events; expecting " + expectedCallsNoSelector);
        
        noSelectorDone = receivedEventsNoSelector.length === expectedCallsNoSelector;
        
        if(noSelectorDone && withSelectorDone){
            cleanup();
            done();
        }
        
    });
    
    //Start WITH Selector Subscriber
    var fn = function(userId, message){
        receivedEventsWithSelector.push(message);
        
        debug && console.log("No Selector: received " + receivedEventsWithSelector.length + " events; expecting " + expectedCallsWithSelector);
        
        withSelectorDone = receivedEventsWithSelector.length === expectedCallsWithSelector;
        
        if(noSelectorDone && withSelectorDone){
            cleanup();
            done();
        }
    };
    
    var subscriber = PubSub.subscribe(topic, fn, {'body.text': 'Hello World'});
    
    test.equal( PubSub.getActiveSubscribers(topic).count(), 2 );
    
    for(i=0; i < testCases.length; i++){
        
        var testCase = testCases[i];
        
        var testCaseMessage = {};  
        var foundMessage = {};
        
        topic.setSchema( Match.test(testCase.schema, Object) ? new SimpleSchema(testCase.schema) : testCase.schema);
        
        if(testCase.body)
            testCaseMessage.body = testCase.body;
        
        try{
                testCaseMessage = topic.createMessage(testCaseMessage.body);
                testCaseMessage._id = PubSub.publish(topic, testCaseMessage);
        }
        catch(e){}
    }
   
    
});
