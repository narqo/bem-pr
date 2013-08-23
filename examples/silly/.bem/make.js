/*global MAKE */

var setsNodes = require('../../../bem/nodes/sets');

// import some globals
require('../../.bem/nodes')(MAKE);

MAKE.decl('Arch', {

    createCustomNodes : function() {
        return new setsNodes.SetsNode({
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
    }

});

MAKE.decl('SetsLevelNode', {

    getSourceItemTechs : function() {
        return ['test.js', 'examples'];
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
//MAKE.decl('TestNode', {
//
//    getLevels : function() {
//        return [];
//    }
//
//});
