exports.baseLevelPath = require.resolve('bem/lib/levels/project');

exports.getTechs = function() {
    return require('../../.bem/levels/common.js').getTechs();
};
