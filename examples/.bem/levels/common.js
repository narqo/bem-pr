var PATH = require('path'),
    BEMPR_TECHS = PATH.resolve(__dirname, '../../../bem/techs'),
    join = PATH.join;

exports.getTechs = function() {
    var techs = {
        'blocks' : '',
        'bundles' : '',
        'examples' : '',
        'bemjson.js' : '',

        'bemdecl.js' : 'bemdecl.js',
        'deps.js' : 'deps.js',
        'js' : 'js-i',
        'css' : 'css',
        'ie.css' : 'ie.css',
        'ie6.css' : 'ie6.css',
        'ie7.css' : 'ie7.css',
        'ie8.css' : 'ie8.css',
        'ie9.css' : 'ie9.css'
    };

    ['sets', 'examples', 'tests.js'].forEach(function(name) {
        techs[name] = join(BEMPR_TECHS, name);
    });

    return techs;
};
