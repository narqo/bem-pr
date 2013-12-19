module.exports = function(registry) {

registry.decl('TestNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'css',
            'js'
        ];
    }

});

};
