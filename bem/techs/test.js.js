var QFS = require('bem/node_modules/q-fs'),
    PATH = require('path');

/**
 * Если в testbundle.bemjson.js есть декларация блока test, и в поле content этого блока
 * перечислены конкретные bem-сущности, то строим декларацию таким образом,
 * чтобы в файл testbundle.test.js попали только тесты этих bem-сущностей.
 */
exports.transformBuildDecl = function(decl) {
    var opts = this.context.opts;

    // XXX: костыль, т.к. иногда transformBuildDecl вызывается в контексте, где нет outputDir и outputName,
    // например из bem/lib/nodes/build.js
    if(!opts.outputDir || !opts.outputName) return decl;

    var output = PATH.resolve(opts.outputDir, opts.outputName);

    return QFS.read(output + '.bemjson.js', { charset: 'utf-8' }).then(function(bemjson) {

        var tests = [];

        JSON.stringify(require('vm').runInThisContext(bemjson), function(key, val) {
            if(key === 'block' && val === 'test') {
                tests = tests.concat(this.content || []);
            }
            return val;
        });

        return tests.length ? { deps: tests } : decl;
    });
};

exports.getBuildResultChunk = function(relPath, path, suffix) {
    return '/*borschik:include:' + relPath + '*/;\n';
};

exports.getDependencies = function() {
    return ['bemjson.js'];
};

exports.getSuffixes = function() {
    return ['test.js'];
};
