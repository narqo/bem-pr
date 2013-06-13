var BEM = require('bem'),
    Q = BEM.require('qq'),
    LOGGER = BEM.require('./logger'),
    CP = require('child_process'),
    PATH = require('path'),
    mochaPhantomjsPath = PATH.resolve(require.resolve('mocha-phantomjs'), '../../bin/mocha-phantomjs');

exports.getDependencies = function() {
    return ['html', 'test.js'];
};

exports.storeBuildResult = function(path, suffix, res) {

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
            '------------------------------',
        ].filter(Boolean).join('\n'));

        if(error !== null) {
            defer.reject('Tests failed');
        }
        else {
            defer.resolve();
        }
    });

    LOGGER.info('[i] Page was sent to Phantom (' + URL + ')');

    return defer.promise;
};
