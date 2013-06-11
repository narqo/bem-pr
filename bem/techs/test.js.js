var QFS = require('bem/node_modules/q-fs');

/**
 * Если в testbundle.bemjson.js есть декларация блока test, и в поле content этого блока
 * перечислены конкретные bem-сущности, то строим декларацию таким образом,
 * чтобы в файл testbundle.test.js попали только тесты этих bem-сущностей.
 */
exports.buildByDecl = function(decl, levels, output) {

    var testDecl = QFS.read(output + '.bemjson.js', { charset: 'utf-8' }).then(function(bemjson) {

        var tests = [];

        JSON.stringify(require('vm').runInThisContext(bemjson), function(key, val) {
            if(key === 'block' && val === 'test') {
                tests = tests.concat(this.content || []);
            }
            return val;
        });

        return tests.length ? { deps: tests } : decl;
    });

    return this.__base.call(this, testDecl, levels, output);
}

exports.getBuildResultChunk = function(relPath, path, suffix) {
    return '/*borschik:include:' + relPath + '*/;\n';
};

exports.getDependencies = function() {
    return ['bemjson.js'];
};

exports.getSuffixes = function() {
    return ['test.js'];
};
