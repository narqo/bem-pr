/* global MAKE:false */

var PATH = require('path');

require('../../../../bem-pr/bem/nodes')(MAKE);

MAKE.decl('Arch', {

    blocksLevelsRegexp : /^.+?\.blocks$/,
    bundlesLevelsRegexp : /^.+?\.bundles$/,

    createCustomNodes : function() {
        var SetsNode = MAKE.getNodeClass('SetsNode');
        return SetsNode
            .create({ root : this.root, arch : this.arch })     // создаем экземпляр узла
            .alterArch();                                       // расширяем процесс сборки новыми узлами из bem-pr
    }

});

MAKE.decl('SetsNode', {

    getSets : function() {
        return {
            'desktop' : ['common.blocks', 'desktop.blocks'],
            //'touch' : [ 'common.blocks', 'touch.blocks' ]
        };
    },

    getSourceTechs : function() {
        return ['tests'];
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

MAKE.decl('TestNode', {

    getTechs : function() {
        return this.__base()
            .concat([
                'test.js+browser.js+bemhtml',
                'phantomjs'
            ]);
    },

    getLevels : function() {
        return this.__base.apply(this, arguments)
            .concat(PATH.resolve(__dirname, '../../../test.blocks'));
    }

});
