var CP = require('child_process'),
    BEM = require('bem'),
    Q = require('q'),
    LOGGER = BEM.require('./logger'),
    PATH = require('path'),
    mochaPhantomjsPath = PATH.resolve(require.resolve('mocha-phantomjs'), '../../bin/mocha-phantomjs');

exports.API_VER = 2;

exports.techMixin = {

    getDependencies : function() {
        return ['html', 'test.js+browser.js+bemhtml'];
    },

    storeCreateResult : function(path, suffix, res, force) {

        var envProps = JSON.parse(process.env.__tests || '{}')[PATH.dirname(path)] || {},
            consoleReporter = envProps.consoleReporter ? '--reporter ' + envProps.consoleReporter : '',
            URL = envProps.pageURL || (PATH.join(PATH.dirname(path), PATH.basename(path, '.phantomjs')) + '.html'),
            defer = Q.defer();

        CP.exec([mochaPhantomjsPath, consoleReporter, URL].join(' '), function (error, stdout, stderr) {
            console.log([
                '------------------------------',
                'Tests results for: ' + PATH.dirname(path),
                stdout && 'stdout: ' + stdout,
                stderr && 'stderr: ' + stderr,
                error  && 'error: ' + error,
                '------------------------------'
            ].filter(Boolean).join('\n'));

            if (error !== null) {
                defer.reject('Tests failed');
            } else {
                defer.resolve();
            }
        });

        LOGGER.info('[i] Page was sent to Phantom (' + URL + ')');

        return defer.promise;
    }

};
