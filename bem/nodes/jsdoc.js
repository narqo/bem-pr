var PATH = require('path'),
    JSDOC = require('bem-jsd');

module.exports = function(registry) {

registry.decl('SetNode', {

    'create-jsdoc-node' : function(item, sourceNode, setNode) {
        return this.createLevelNode(item, sourceNode, setNode, 'JsdocLevelNode');
    }

});

registry.decl('JsdocLevelNode', 'DocsLevelNode', {

    getBundleNodeClass : function() {
        return 'JsdocSourceNode';
    }

});

registry.decl('JsdocSourceNode', 'DocsSourceNode', {

    processContent : function(content) {
        try {
            return JSON.stringify(JSDOC(content), null, 2);
        } catch(e) {
            if(e.message) {
                e.message = 'Error while processing files:\n' +
                    this.sources.join('\n') + '\n\n' +
                    e.message;
            }
            throw e;
        }
    }

}, {

    createPath : function(o) {
        return PATH.join(o.level, this.createNodePrefix(o.item) + '.jsdoc.json');
    }

});

};
