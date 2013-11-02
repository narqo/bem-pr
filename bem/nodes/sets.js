/**
 * @fileOverview Узлы для сборки наборов БЭМ-сущностей (sets)
 */

module.exports = function(registry) {

require('./monkey')(registry);
require('./common')(registry);
require('./examples')(registry);
require('./tests')(registry);

var FS = require('fs'),
    BEM = require('bem'),
    Q = require('q'),
    _ = require('underscore'),
    createLevel = BEM.createLevel,
    logger = BEM.logger,
    Node = registry.getNodeClass('Node'),
    BlockNode = registry.getNodeClass('BlockNode'),
    /** Id главного узла сборки наборов */
    SETS_NODE_ID = 'sets';


registry.decl('SetsNode', 'Node', {

    __constructor : function(o) {
         this.__base(o);

         this.arch = o.arch;
         this.root = o.root;
         this.rootLevel = createLevel(this.root);
    },

    alterArch : function(parent, children) {
        var _t = this,
            arch = _t.arch;

        return Q.when(this.createCommonSetsNode(parent))
            .then(function(common) {
                return _t.createSetsLevelNodes(parent? [common].concat(parent) : common, children);
            })
            .then(function() {
                return arch;
            })
            .fail(logger.error);
    },

    createCommonSetsNode : function(parent) {
        var node = new Node(SETS_NODE_ID);
        this.arch.setNode(node, parent);
        return node.getId();
    },

    createSetsLevelNodes : function(parents, children) {
        var arch = this.arch,
            sets = this.getSets(),
            node;

        return Object.keys(sets).map(function(name) {
            node = registry.getNodeClass('SetsLevelNode').create({
                root    : this.root,
                level   : this.rootLevel,
                item    : { block : name, tech : 'sets' },
                sources : sets[name]
            });

            arch.setNode(node);

            parents && arch.addParents(node, parents);
            children && arch.addChildren(node, children);

            return node.getId();
        }, this);
    },

    /**
     * @returns {Object} Описание наборов `{ name : [level1, level2] }`
     */
    getSets : function() {
        return {};
    }

}, {

    create : function(o) {
        return new this(o);
    }

});


registry.decl('SetsLevelNode', 'GeneratedLevelNode', {

    alterArch : function() {
        var base = this.__base();
        return function() {

            var _t = this,
                arch = _t.ctx.arch;

            return Q.when(base.call(this), function(level) {
                var realLevel = arch.getChildren(level),
                    getNodeClassForSuffix = _t.getNodeClsForSuffix.bind(_t),
                    decls = _t.scanSources();

                decls.forEach(function(item) {
                    // creating block node (source) for item
                    var o = {
                            root  : this.root,
                            item  : item,
                            level : item.level
                        },
                        blockNode,
                        blocknid = BlockNode.createId(o);

                    if(arch.hasNode(blocknid)) {
                        blockNode = arch.getNode(blocknid);
                    } else {
                        blockNode = new BlockNode(o);
                        arch.setNode(blockNode);
                    }

                    // creating levels node for item (examples, tests, whatever)
                    o = {
                        root  : this.root,
                        level : this.path,
                        item  : item
                    };

                    var LevelNodeCls = registry.getNodeClass(getNodeClassForSuffix(item.suffix)),
                        levelnid = LevelNodeCls.createId(o),
                        levelNode;

                    if(arch.hasNode(levelnid)) {
                        levelNode = arch.getNode(levelnid);
                    } else {
                        levelNode = LevelNodeCls.create(o);
                        arch.setNode(levelNode, level, realLevel);
                    }

                    arch.addChildren(levelNode, blockNode);

                    var source = blockNode.level.getPathByObj(item, item.tech);
                    if(FS.existsSync(source)) {
                        levelNode.sources.push(source);
                    }
                }, _t);

                return Q.when(_t.takeSnapshot('After SetsLevelNode alterArch ' + _t.getId()));
            });

        };

    },

    getSourceItemsMap : function() {
        return {
            examples : ['examples'],
            tests : ['tests', 'test.js'],
            docs : ['md', 'wiki']
        };
    },

    getSourceItemTechs : function() {
        var map = this.getSourceItemsMap();
        return _.uniq(Object.keys(map).reduce(function(techs, name) {
                return techs.concat(map[name]);
            }, []));
    },

    getNodeClsForSuffix : function(suffix) {
        return {
            '.examples' : 'ExamplesLevelNode',
            '.tests'    : 'TestsLevelNode',
            '.test.js'  : 'TestsLevelNode'
        }[suffix];
    }

});

};
