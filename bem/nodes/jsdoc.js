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
        return JSON.stringify(JSDOC(content), null, 2);
    }

}, {

    createPath : function(o) {
        return PATH.join(o.level, this.createNodePrefix(o.item) + '.jsdoc.json');
    }

});

};
