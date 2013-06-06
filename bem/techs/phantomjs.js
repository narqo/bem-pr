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
        URL = envProps.pageURL || (PATH.join(PATH.dirname(path), PATH.basename(path, '.phantomjs')) + '.html'),
        defer = Q.defer();

    CP.exec(mochaPhantomjsPath + ' ' + URL, function (error, stdout, stderr) {

        console.log([
            '------------------------------',
            'Tests results for: ' + PATH.dirname(path),
            stdout && 'stdout: ' + stdout,
            stderr && 'stderr: ' + stderr,
            error  && 'error: ' + error,
            '------------------------------',
        ].filter(Boolean).join('\n'));

        if(error !== null) {
            defer.reject();
        }
        else {
            defer.resolve();
        }
    });

    LOGGER.info('[i] Page was sent to Phantom (' + path + ')');

    return defer.promise;
};
