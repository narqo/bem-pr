var PATH = require('path');

module.exports = function(registry) {

registry.decl('TestNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'css',
            'js',
            'test.js'
        ];
    },

    getLevels : function() {
        var levels = this.__base.apply(this, arguments);
        levels.push(PATH.resolve(__dirname, '../../../test.blocks'));
        return levels;
    }

});

};
