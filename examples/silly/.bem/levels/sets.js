var PATH = require('path'),
    util = require('bem/lib/util'),

    commonTechs = require('../../../.bem/levels/common.js').getTechs(),
    sillyTechs = {};

['examples', 'tests'].forEach(function(name) {
    sillyTechs[name] = PATH.resolve(__dirname, '../techs/' + name + '.js');
});

exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    return util.extend(this.__base() || {}, commonTechs, sillyTechs);
};
