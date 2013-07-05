var util = require('bem/lib/util'),
    commonLevel = require('./common.js');

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    return util.extend(commonLevel.getTechs(), { /* 'place_them': 'here' */ });
};
