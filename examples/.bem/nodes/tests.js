var registry = require('bem/lib/nodesregistry');

registry.decl('TestNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'test.js'
        ];
    }

});
