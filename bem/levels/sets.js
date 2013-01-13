var PATH = require('path'),
    PRJ_TECHS = PATH.resolve(__dirname, '../techs');

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    
    return {
        'examples'  : PATH.join(PRJ_TECHS, 'examples.js'),
        'tests'     : ''    // TODO
    };
    
};
