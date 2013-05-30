var BEM = require('bem'),
    Q = BEM.require('qq'),
    CP = require('child_process'),
    PATH = require('path'),
    tmpl = BEM.require('./template'),
    logger = BEM.require('./logger'),
    phantom = require('phantomjs');

exports.getBuildResult = function(prefixes, suffix, outputDir, outputName) {

    var envProps = JSON.parse(process.env.__tests || '{}')[PATH.resolve(outputDir)] || {};

    return tmpl.process([
        'var url = phantom.args[0] || "{{bemURL}}";',
        '',
        'if(!url) {',
        '    console.error("You must specify url");',
        '    phantom.exit(-1);',
        '}',
        '',
        'var page = require("webpage").create();',
        '',
        'page.onConsoleMessage = function(msg) {',
        '',
        '    switch(msg) {',
        '        case "__SUCCESS":',
        '            return phantom.exit();',
        '            ',
        '        case "__FAILED":',
        '            return phantom.exit(-1);',
        '            ',
        '        default:',
        '            if(msg.indexOf("Error") > -1) {',
        '                console.error(msg);',
        '                return phantom.exit(-1);',
        '            }',
        '            else {',
        '                console.log(msg);',
        '            }',
        '    }',
        '',
        '};',
        '',
        'page.open(url, function(status) {',
        '    if(status !== "success") {',
        '        console.error("Unable to access url");',
        '        phantom.exit(-1);',
        '    }',
        '',
        '    page.evaluate(function() {',
        '        try {',
        '            jasmine._reporterInstance = new jasmine.ConsoleReporter({',
        '                finishCallback : function(runner) {',
        '                    console.log(runner.results().failedCount ? "__FAILED" : "__SUCCESS");',
        '                },',
        '                colored        : true',
        '            });',
        '        } catch (e) {',
        '            console.log(e);',
        '        }',
        '    });',
        '});',
        '',
        'console.error = function(msg) {',
        '    this.log("\\033[31m" + msg + "\\033[0m");',
        '};',
    ], {
        URL: envProps.pageURL || PATH.join(outputDir, outputName + '.html')
    });
};

exports.getDependencies = function() {
    return ['html'];
};

exports.storeBuildResult = function(path, suffix, res) {

    return this.__base.apply(this, arguments).then(function() {

        var defer = Q.defer();

        CP.exec(phantom.path + ' ' + path, function (error, stdout, stderr) {

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

        logger.info('[i] Page was sent to Phantom (' + path + ')');

        return defer.promise;
    });
};
