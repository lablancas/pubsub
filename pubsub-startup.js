/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-26
* Time: 01:55 AM
* To change this template use Tools | Templates.
*/

Meteor.startup(function(){

    // clear old subscribers out
    PubSub.getActiveSubscribers().forEach(PubSub.unsubscribe);


});