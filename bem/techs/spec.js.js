var PATH = require('path'),
    VM = require('vm'),
    QFS = require('q-io/fs'),
    DEPS = require('bem/lib/techs/v2/deps.js');

exports.API_VER = 2;

exports.techMixin = {

    /**
     * Если в <bundle>.bemjson.js есть декларация блока "spec", и в поле "decl" блока
     * перечислены конкретные БЭМ-сущности, то строим декларацию таким образом,
     * чтобы в файл <bundle>.spec.js попали **только** тесты этих БЭМ-сущностей.
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
            var specs = [];

            JSON.stringify(VM.runInThisContext(bemjson), function(key, val) {
                if(key === 'block' && val === 'spec') {
                    specs = specs.concat(this.decl || []);
                }
                return val;
            });

            if(specs.length) {
                var deps = new DEPS.Deps();
                deps.parse(specs);
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
        return ['spec.js'];
    }

};
