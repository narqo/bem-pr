var PATH = require('path');

module.exports = function(registry) {

registry.decl('SpecNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'css',
            'js',
            'spec.js'
        ];
    },

    getLevels : function() {
        var levels = this.__base.apply(this, arguments);
        levels.push(PATH.resolve(__dirname, '../../../spec.blocks'));
        return levels;
    }

});

};
