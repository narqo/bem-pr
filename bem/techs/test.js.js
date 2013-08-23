var PATH = require('path'),
    QFS = require('bem/node_modules/q-fs'),
    DEPS = require('bem/lib/techs/v2/deps.js');

exports.API_VER = 2;

exports.techMixin = {

    /**
     * Если в testbundle.bemjson.js есть декларация блока "test", и в поле "decl" блока
     * перечислены конкретные БЭМ-сущности, то строим декларацию таким образом,
     * чтобы в файл testbundle.test.js попали только тесты этих БЭМ-сущностей.
     *
     * @param {Object} decl
     * @returns {Object}
     */
    transformBuildDecl : function(decl) {
        var opts = this.context.opts;

        // XXX: костыль, т.к. иногда transformBuildDecl вызывается в контексте, где нет outputDir и outputName,
        // например из bem/lib/nodes/build.js
        if(!opts.outputDir || !opts.outputName) return decl;

        var output = PATH.resolve(opts.outputDir, opts.outputName);

        return QFS.read(output + '.bemjson.js', { charset: 'utf8' }).then(function(bemjson) {
            var tests = [];

            JSON.stringify(require('vm').runInThisContext(bemjson), function(key, val) {
                if(key === 'block' && val === 'test') {
                    tests = tests.concat(this.decl || []);
                }
                return val;
            });

            if(tests.length) {
                var deps = new DEPS.Deps();
                deps.parse(tests);
                return { deps : deps.serialize()[''][''] };
            } else {
                return decl;
            }
        });
    },

    getBuildResultChunk : function(relPath, path, suffix) {
        return '/*borschik:include:' + relPath + '*/;\n';
    },

    getDependencies : function() {
        return ['bemjson.js'];
    },

    getSuffixes : function() {
        return ['test.js'];
    }

};
