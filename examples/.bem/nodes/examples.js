var registry = require('bem/lib/nodesregistry');

registry.decl('ExampleNode', {

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
