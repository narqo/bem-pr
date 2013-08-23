var PATH = require('path'),
    PRJ_TECHS = PATH.resolve(__dirname, '../techs'),
    resolveTech = PATH.join.bind(null, PRJ_TECHS);

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    return {
        'sets'      : resolveTech('sets.js'),
        'examples'  : resolveTech('examples.js'),
        'tests'     : resolveTech('tests.js')
    };
};
