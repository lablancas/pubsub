/*
 * Created with MakeItHappen.
 * User: lablancas
 * Date: 2015-03-22
 * Time: 08:10 PM
 * To change this template use Tools | Templates.
 */

PubSub.Collections.Messages.allow({
    remove: function(){ return true; }
});

PubSub.Collections.Topics.allow({
    remove: function(){ return true; }
});

PubSub.Collections.TopicSubscribers.allow({
    remove: function(){ return true; }
});
