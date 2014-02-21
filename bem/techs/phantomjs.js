var CP = require('child_process'),
    PATH = require('path'),
    URL = require('url'),
    BEM = require('bem'),
    Q = require('q'),
    LOGGER = BEM.logger,
    MOCHA_PHANTOM_PATH = require.resolve('mocha-phantomjs/bin/mocha-phantomjs'),
    MOCHA_REPORTER = 'spec';

exports.API_VER = 2;

exports.techMixin = {

    getDependencies : function() {
        return ['html', 'spec.js'];
    },

    createByDecl : function(item, level) {
        var root = this.context.opts.dir || '',
            prefix = level.getByObj(item),
            path = this.getPath(prefix, 'html'),
            reporter = '--reporter ' + (process.env.MOCHA_PHANTOM_REPORTER || MOCHA_REPORTER),
            url = URL.format({
                protocol : 'file',
                host : '/',
                pathname : path
            }),
            defer = Q.defer();

        CP.exec([MOCHA_PHANTOM_PATH, reporter, url].join(' '), function(err, stdout, stderr) {
            var report = [
                    'Tests results for "' + PATH.relative(root, path) + '"',
                    stdout,
                    stderr? 'Stderr: ' + stderr : ''
                ]
                .join('\n');

            LOGGER.info(report);

            if(err === null) {
                defer.resolve();
            } else {
                LOGGER.error('Tests failed:', err);
                defer.reject(err);
            }
        });

        LOGGER.info('[i] Page was sent to Phantom (' + url + ')');

        return defer.promise;
    }

};
