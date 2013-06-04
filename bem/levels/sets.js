var PATH = require('path'),
    PRJ_TECHS = PATH.resolve(__dirname, '../techs'),
    join = PATH.join.bind(null, PRJ_TECHS);

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {

    return {
        'sets'      : join('sets.js'),
        'examples'  : join('examples.js'),
        'tests'     : join('tests.js')
    };

};
