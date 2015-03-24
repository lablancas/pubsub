/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-22
 * Time: 08:10 PM
 * To change this template use Tools | Templates.
 */

Collections.Messages.allow({
    insert: function(userId, doc){ 
        return userId === doc.header.createdBy; 
    },
    fetch: ['header.createdBy']
});

Collections.Topics.allow({
    insert: function(userId, doc){ 
        return userId === doc.createdBy; 
    },
    fetch: ['createdBy']
});

Collections.TopicSubscribers.allow({
    insert: function(userId, doc){ return userId === doc.startedBy; },
    update: function(userId, doc){ return userId === doc.startedBy; },
    fetch: ['startedBy']
});
