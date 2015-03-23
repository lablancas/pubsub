Package.describe({
    name: 'lablancas:pubsub',
    version: '0.0.7',
    // Brief, one-line summary of the package.
    summary: 'A publish/subscribe messaging package designed for Meteor',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/lablancas/pubsub',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.4.2');

    api.use('check');
    api.use('mongo');
    
    api.use('aldeed:collection2@2.1.0');
    api.use('matb33:collection-hooks@0.7.6');

    api.addFiles('pubsub-schemas.js');
    api.addFiles('pubsub-topics.js');
    api.addFiles('pubsub-collections.js');
    api.addFiles('pubsub.js');
    
    api.export('PubSub');
    api.export('Messages', {testOnly: true});
    api.export('TopicSubscribers', {testOnly: true});
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('underscore');
    api.use('lablancas:pubsub');
    
    api.use('aldeed:simple-schema@1.0.3');
    
    api.addFiles('pubsub-tests.js');
    api.addFiles('pubsub-collection-permissions.js');
});
