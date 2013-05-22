var PATH = require('path'),
    PRJ_TECHS = PATH.resolve(__dirname, '../techs');

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {

    return {
        'sets'      : PATH.join(PRJ_TECHS, 'sets.js'),
        'examples'  : PATH.join(PRJ_TECHS, 'examples.js'),
        'tests'     : PATH.join(PRJ_TECHS, 'tests.js')
    };

};
