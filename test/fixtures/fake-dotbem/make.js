/* global MAKE:false */

var PATH = require('path');

require('../../../../bem-pr/bem/nodes')(MAKE);

MAKE.decl('Arch', {

    blocksLevelsRegexp : /^.+?\.blocks$/,
    bundlesLevelsRegexp : /^.+?\.bundles$/,

    createCustomNodes : function() {
        var SetsNode = MAKE.getNodeClass('SetsNode');

        if(typeof SetsNode.createId === 'undefined') {
            return;
        }

        return new SetsNode({ root : this.root, arch : this.arch }).alterArch();
    }

});

MAKE.decl('SetsNode', {

    getSets : function() {
        return {
            'desktop' : ['common.blocks', 'desktop.blocks'],
            'touch' : [ 'common.blocks', 'touch.blocks' ]
        };
    },

    getSourceTechs : function() {
        return ['specs'];
    }

});

MAKE.decl('TargetBundleNode', {

    'desktop-levels' : function() {
        return [
            'common.blocks',
            'desktop.blocks'
        ];
    },

    'touch-levels' : function() {
        return [
            'common.blocks',
            'touch.blocks'
        ];
    },

    getLevels : function() {
        var resolve = PATH.resolve.bind(PATH, this.root),
            getLevels = this.getLevelPath().split('.')[0] + '-levels',
            levels = [];

        if(typeof this[getLevels] === 'function') {
            Array.prototype.push.apply(levels, this[getLevels]());
        }

        if(!levels.length) {
            return [];
        }

        return levels.map(function(level) {
            return resolve(level);
        });
    }

});

MAKE.decl('ExampleNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'css',
            'browser.js',
            'bemhtml',
            'html'
        ];
    },

    getLevels : function() {
        return this.__base()
            .concat(this.rootLevel
                .getTech('blocks')
                .getPath(this.getSourceNodePrefix()));
    }

});

MAKE.decl('SpecNode', {

    getTechs : function() {
        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'css',
            'spec.js+browser.js+bemhtml',
            'bemhtml',
            'html',
            'phantomjs'
        ];
    },

    getLevels : function() {
        return this.__base.apply(this, arguments)
            .concat(PATH.resolve(__dirname, '../../../spec.blocks'));
    }

});
