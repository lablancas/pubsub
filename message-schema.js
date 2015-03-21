/**
* Created with MakeItHappen.
* User: lablancas
* Date: 2015-03-20
* Time: 03:05 PM
* To change this template use Tools | Templates.
*/

MESSAGE_SCHEMA = {
    // Force value to be current date (on server) upon insert
    // and prevent updates thereafter.
    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {$setOnInsert: new Date};
            } else {
                this.unset();
            }
        }
    },
    
    createdBy: {
        type: String,
        autoValue: function() {
            if (this.isInsert) {
                return this.userId || 'server';
            } else if (this.isUpsert) {
                return {$setOnInsert: this.userId || 'server'};
            } else {
                this.unset();
            }
        }
    },
    
    body: {
        type: Object,
        optional: true,
        blackbox: true
    }
    
    //TODO add publishedTo [] to log subscriber IDs
};