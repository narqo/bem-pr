exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    return require('../../.bem/levels/common.js').getTechs();
};