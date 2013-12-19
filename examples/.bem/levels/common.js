var PATH = require('path'),
    BEMPR_TECHS = PATH.resolve(__dirname, '../../../bem/techs');

function resolveTechs(registry, prefix) {
    return function(name) {
        registry[name] = PATH.join(prefix, name + '.js');
    };
}

exports.getTechs = function() {
    var techs = {
        'blocks' : 'v2/level-proto',
        'bundles' : 'v2/level-proto',
        'examples' : 'v2/level-proto',
        'tests' : 'v2/level-proto',
        'specs' : 'v2/level-proto',
        'bemjson.js' : 'bem/lib/tech/v2',

        'bemdecl.js' : 'v2/bemdecl.js',
        'deps.js' : 'v2/deps.js',
        'js' : 'v2/js-i',
        'css' : 'v2/css',
        'ie.css' : 'v2/ie.css',
        'ie6.css' : 'v2/ie6.css',
        'ie7.css' : 'v2/ie7.css',
        'ie8.css' : 'v2/ie8.css',
        'ie9.css' : 'v2/ie9.css'
    };

    [
        'spec.bemjson.js',
        'spec.js',
        'phantomjs'
    ].forEach(resolveTechs(techs, BEMPR_TECHS));

    return techs;
};
