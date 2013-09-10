function init(registry) {

// import bem-pr's nodes
require('../../../bem/nodes').init(registry);

// import some common nodes
require('../../.bem/nodes').init(registry);

registry.decl('Arch', {

    createCustomNodes : function() {
        return registry.getNodeClass('SetsNode')
            .create({
                root : this.root,
                arch : this.arch
            })
            .alterArch();
    }

});

registry.decl('SetsNode', {

    getSets : function() {
        return {
            'desktop' : ['common.blocks', 'desktop.blocks'],
            'touch' : ['common.blocks', 'touch.blocks']
        };
    }

});

registry.decl('SetsLevelNode', {

    getSourceItemTechs : function() {
        return ['test.js', 'examples'];
    }

});

// TODO: configure examples building process
//registry.decl('ExampleNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});

// TODO: configure tests building process
//registry.decl('TestNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});

};

if(typeof MAKE === 'undefined') {
    module.exports = init;
} else {
    init(MAKE);
}
