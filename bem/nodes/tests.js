module.exports = function(registry) {

registry.decl('TestsLevelNode', 'ExamplesLevelNode', {

    getProtoLevelName : function() {
        return 'tests-set';
    },

    getBundleNodeClassName : function() {
        return 'TestNode';
    }

});

registry.decl('TestNode', 'ExampleNode', {

});

};
