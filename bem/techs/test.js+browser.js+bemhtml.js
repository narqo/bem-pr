var PATH = require('path'),
    DEPS = require('bem/lib/techs/deps.js'),
    BEM = require('bem'),
    Q = BEM.require('q');

function getTechBuildResults(techName, decl, context) {
    var opts = context.opts,
        tech = context.createTech(techName),
        output = PATH.resolve(opts.outputDir, opts.outputName);

    return tech.getBuildResults(
        tech.getBuildPrefixes(
            tech.transformBuildDecl(decl),
            context.getLevels()
        ),
        PATH.dirname(output) + PATH.dirSep,
        PATH.basename(output)
    );
}

exports.techMixin = {

    getSuffixes : function() {
        return ['test.js'];
    },

    getBuildSuffixes : function() {
        return ['test.js'];
    },

    /**
     * Build and return result of build of specified prefixes
     * for specified suffix.
     *
     * @param {Promise * String[]} prefixes Prefixes to build from.
     * @param {String} suffix Suffix to build result for.
     * @param {String} outputDir Output dir name for build result.
     * @param {String} outputName Output name of build result.
     * @returns {Promise * String} Promise for build result.
     */
    getBuildResult: function(prefixes, suffix, outputDir, outputName) {
        var context = this.context,
            opts = context.opts;

        return opts.declaration
            .then(function(decl) {
                var testJsResults = getTechBuildResults('test.js', decl, context),
                    browserJsResults = getTechBuildResults('browser.js', decl, context),
                    bemhtmlDecl = new DEPS.Deps(),
                    depsByTechs = decl.depsByTechs || {},
                    depsByTechsJs = depsByTechs.js || {},
                    depsByTechsTestJs = depsByTechs['test.js'] || {};

                bemhtmlDecl.parse(depsByTechsJs.bemhtml || []);
                bemhtmlDecl.parse(depsByTechsTestJs.bemhtml || []);

                bemhtmlDecl = { deps: bemhtmlDecl.serialize()['bemhtml']['bemhtml'] };

                var bemhtmlResults = getTechBuildResults('bemhtml', bemhtmlDecl, context);

                return Q.all([testJsResults, browserJsResults, bemhtmlResults])
                    .spread(function(testJsResults, browserJsResults, bemhtmlResults) {
                        return [
                            browserJsResults['js'].join(''),
                            testJsResults['test.js'].join(''),
                            bemhtmlResults['bemhtml.js']
                        ].join('');
                    });

            })
    }

};
