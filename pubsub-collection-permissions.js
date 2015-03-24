/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-22
 * Time: 08:10 PM
 * To change this template use Tools | Templates.
 */

Collections.Messages.allow({
    insert: function(userId, doc){ 
        var allowed = userId === doc.header.createdBy; 
        PubSub.debug && !allowed && console.log("insert message failed for user " + userId + " " + JSON.stringify(doc))
        return allowed;
    },
    fetch: ['header.createdBy']
});

Collections.Topics.allow({
    insert: function(userId, doc){ 
        var allowed = userId === doc.createdBy; 
        PubSub.debug && !allowed && console.log("insert topic failed for user " + userId + " " + JSON.stringify(doc))
        return allowed;
    },
    fetch: ['createdBy']
});

Collections.TopicSubscribers.allow({
    insert: function(userId, doc){ 
        var allowed = userId === doc.startedBy; 
        PubSub.debug && !allowed && console.log("insert topic subscriber failed for user " + userId + " " + JSON.stringify(doc))
        return allowed;
                                 
    },
    update: function(userId, doc){ 
        var allowed = userId === doc.startedBy; 
        PubSub.debug && !allowed && console.log("update topic subscriber failed for user " + userId + " " + JSON.stringify(doc))
        return allowed;
    },
    fetch: ['startedBy']
});
