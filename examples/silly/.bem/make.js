/*global MAKE */

require('../../../bem/nodes')(MAKE);

// import some globals
require('../../.bem/nodes')(MAKE);

MAKE.decl('Arch', {

    createCustomNodes : function() {
        var SetsNode = MAKE.getNodeClass('SetsNode');

        return new SetsNode({
                root : this.root,
                arch : this.arch
            })
            .alterArch();
    }

});

MAKE.decl('SetsNode', {

    getSets : function() {
        return {
            'desktop' : ['common.blocks', 'desktop.blocks'],
            'touch' : ['common.blocks', 'touch.blocks']
        };
    },

    getSourceTechs : function(setName) {
        //return ['examples'];
        return ['tests'];
//        return ['specs'];
//        return ['examples', 'specs'];
    }

});

// TODO: configure examples building process
//MAKE.decl('ExampleNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});

// TODO: configure tests building process
//MAKE.decl('SpecNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});

// TODO: configure tests building process
//MAKE.decl('TestNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});
