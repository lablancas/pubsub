/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-23
 * Time: 02:03 PM
 * To change this template use Tools | Templates.
 */

Collections.Messages.allow({
    insert: function(){ return true; },
    remove: function(){ return true; }
});

Collections.Topics.allow({
    insert: function(){ return true; },
    remove: function(){ return true; }
});

Collections.TopicSubscribers.allow({
    insert: function(){ return true; },
    update: function(){ return true; },
    remove: function(){ return true; }
});