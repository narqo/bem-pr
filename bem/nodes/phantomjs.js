var URL = require('url'),
    BEM = require('bem'),
    Q = require('q'),
    exec = require('child_process').exec,
    LOGGER = BEM.logger,
    MOCHA_PHANTOM_BIN = require.resolve('mocha-phantomjs/bin/mocha-phantomjs'),
    mochaReporter = process.env.MOCHA_PHANTOM_REPORTER || 'spec';

module.exports = function(registry) {

registry.decl('PhantomJsNode', 'FileNode', {

    make : function() {
        var _this = this,
            url = URL.format({
                protocol : 'file',
                host : '/',
                pathname : this.getPath()
            }),
            defer = Q.defer();

        exec([MOCHA_PHANTOM_BIN, '--reporter', mochaReporter, url].join(' '), function(err, stdout, stderr) {
            LOGGER.finfo('Tests results for "%s":\n%s', _this.path, stdout, stderr? '\nStderr: ' + stderr : '');

            if(err === null) {
                defer.resolve();
                return;
            }
            LOGGER.error('Tests failed:', err);
            defer.reject(err);
        });

        LOGGER.info('[i] Page was sent to Phantom (' + url + ')');

        return defer.promise;
    },

    isValid : function() {
        return Q.resolve(false);
    }

}, {

    createId : function(o) {
        return this.__base(o) + '.phantomjs';
    }

});

};
