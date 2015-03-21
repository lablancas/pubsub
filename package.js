Package.describe({
    name: 'lablancas:pubsub',
    version: '0.0.6',
    // Brief, one-line summary of the package.
    summary: 'A publish/subscribe package designed for Meteor',
    // URL to the Git repository containing the source code for this package.
    git: 'https://github.com/lablancas/pubsub',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
    api.versionsFrom('1.0.4.2');

    api.use('mongo');
    
    api.use('aldeed:collection2@2.1.0');
    api.use('matb33:collection-hooks@0.7.6');

    api.addFiles('pubsub.js');
    api.addFiles('topic.js');
    
    api.export('PubSub');
});

Package.onTest(function(api) {
    api.use('tinytest');
    api.use('underscore');
    api.use('lablancas:pubsub');
    
    api.use('aldeed:simple-schema@1.0.3');
    
    api.addFiles('topic-tests.js');
});
