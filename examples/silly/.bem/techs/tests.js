var PATH = require('path');

exports.baseTechPath = require.resolve('../../../../bem/techs/tests.js');

exports.getBaseLevel = function() {
    return PATH.resolve(__dirname, '../levels/bundles.js');
};
