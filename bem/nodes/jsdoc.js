var PATH = require('path'),
    UTIL = require('util'),
    JSDOC = require('bem-jsd'),
    JSDTMD = require('../../vendor/jsdtmd.xjst.js').JSDTMD;

module.exports = function(registry) {

registry.decl('SetNode', {

    'create-jsdoc-node' : function(item, sourceNode, setNode) {
        return this.createLevelNode(item, sourceNode, setNode, 'JsdocLevelNode');
    }

});

registry.decl('JsdocLevelNode', 'MetadocLevelNode', {

    getBundleNodeClass : function() {
        return 'JsdocSourceNode';
    }

});

registry.decl('JsdocSourceNode', 'MetadocSourceNode', {

    processContent : function(content) {
        try {
            return JSDTMD.apply(JSDOC(content));
            //return JSON.stringify(JSDOC(content), null, 2);
        } catch(e) {
            e.message = UTIL.format('Error while processing files:\n%s\n\n', this.sources.join('\n')) + e.message;
            throw e;
        }
    }

}, {

    createPath : function(o) {
        return PATH.join(o.level, this.createNodePrefix(o.item) + '.md');
    }

});

};
