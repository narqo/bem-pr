var PATH = require('path'),
    DEPS = require('bem/lib/techs/deps.js'),
    BEM = require('bem'),
    Q = BEM.require('q');

function getTechBuildResults(techName, decl, context, output, opts) {
    opts.force = true;
    var tech = context.createTech(techName);

    if (tech.API_VER !== 2) return Q.reject(new Error(_this.getTechName() +
        ' can’t use v1 ' + tech + ' tech to concat ' + tech + ' content. Configure level to use v2 ' + tech + '.'));

    return tech.getBuildResults(
        decl,
        context.getLevels(),
        output,
        opts
    );
}

exports.API_VER = 2;

exports.techMixin = {

    getBuildSuffixesMap: function() {
        return {
            'test.js': ['test.js', 'vanilla.js', 'js', 'browser.js', 'bemhtml']
        };
    },

    getBuildResult: function(files, suffix, output, opts) {
        var context = this.context,
            ctxOpts = context.opts;

        return ctxOpts.declaration
            .then(function(decl) {
                var testJsResults = getTechBuildResults('test.js', decl, context, output, opts),
                    browserJsResults = getTechBuildResults('browser.js', decl, context, output, opts),
                    bemhtmlDecl = new DEPS.Deps(),
                    depsByTechs = decl.depsByTechs || {},
                    depsByTechsJs = depsByTechs.js || {},
                    depsByTechsTestJs = depsByTechs['test.js'] || {};

                bemhtmlDecl.parse(depsByTechsJs.bemhtml || []);
                bemhtmlDecl.parse(depsByTechsTestJs.bemhtml || []);

                bemhtmlDecl = { deps: bemhtmlDecl.serialize()['bemhtml']['bemhtml'] };

                var bemhtmlResults = getTechBuildResults('bemhtml', bemhtmlDecl, context, output, opts);

                return Q.all([testJsResults, browserJsResults, bemhtmlResults])
                    .spread(function(testJsResults, browserJsResults, bemhtmlResults) {
                        return [
                            browserJsResults['js'].join(''),
                            testJsResults['test.js'].join(''),
                            bemhtmlResults['bemhtml.js']
                        ].join('');
                    });

            });
    }

};
