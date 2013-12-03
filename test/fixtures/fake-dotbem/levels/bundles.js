var PATH = require('path');

exports.baseLevelPath = require.resolve('./blocks');

exports.getTechs = function() {
    var techs = this.__base();

    ['phantomjs', 'specs.bemjson.js'].forEach(
        this.resolveTechs(techs, PATH.resolve(__dirname, '../../../../../bem-pr/bem/techs')));

    return techs;
};
