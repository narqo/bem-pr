var PATH = require('path');

exports.baseTechPath = require.resolve('../../../../bem/techs/examples.js');

exports.getBaseLevel = function() {
    return PATH.resolve(__dirname, '../levels/bundles.js');
};