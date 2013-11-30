var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    //_ = require('underscore'),
    createLevel = BEM.createLevel,
    logger = BEM.logger,
    U = BEM.util,
    /** Id главного узла сборки наборов */
    SETS_NODE_ID = 'sets';

module.exports = function(registry) {

var Node = registry.getNodeClass('Node'),
    BlockNode = registry.getNodeClass('BlockNode');

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

        return Q.when(this.createRootSetsNode(parent))
            .then(function(common) {
                return _t.createSetsNodes(parent? [common].concat(parent) : common, children);
            })
            .then(function() {
                return arch;
            })
            .fail(logger.error);
    },

    /**
     * Creates special root node `sets`
     * @param parent
     * @returns {String}
     * @private
     */
    createRootSetsNode : function(parent) {
        var node = new Node(SETS_NODE_ID);
        this.arch.setNode(node, parent);
        return node.getId();
    },

    createSetsNodes : function(parents, children) {
        var arch = this.arch,
            sets = this.getSets(),
            SetNode = registry.getNodeClass('SetNode'),
            setLevesCollection = [],
            levelsNodes, node;

        // zip sets and source techs into set collection
        Object.keys(sets).reduce(function(nodes, setName) {
            levelsNodes = this.getSourceItemTechs().map(function(techName) {
                node = new SetNode({
                    root : this.root,
                    level : this.rootLevel,
                    item : { block : setName },
                    techName : techName,
                    sources : sets[setName]
                });

                arch.setNode(node);

                parents && arch.addParents(node, parents);
                children && arch.addChildren(node, children);

                return node.getId();
            }, this);

            return nodes.concat(levelsNodes);
        }.bind(this), setLevesCollection);

        return Q.all(setLevesCollection);
    },

    /**
     * Sets description `{ name : [sourceLevel1, sourceLevel2] }`
     *
     * @example
     *   { desktop : ['common.blocks', 'desktop.blocks'] }
     *
     * @returns {Object}
     */
    getSets : function() {
        return {};
    },

    /**
     * Tech names list for each set
     * @returns {Array}
     */
    getSourceItemTechs : function() {
        return [];
    }

}, {

    create : function(o) {
        return new this(o);
    }

});


registry.decl('SetNode', 'MagicNode', {

    __constructor : function(o) {
        this.level = o.level;
        this.item = o.item;
        this.tech = this.level.getTech(o.techName);
        this.sources = o.sources || [];

        this.__base(U.extend({ path : this.__self.createPath(o) }, o));
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx,
            arch = ctx.arch;

        return function() {
            var setNode = this.createCollectionNode(),
                virtualSetNode;

            if(arch.hasNode(this.path)) {
                virtualSetNode = arch.getNode(this.path);
            } else {
                virtualSetNode = new Node(this.path);
                arch.setNode(virtualSetNode, arch.getParents(this), setNode);
            }

            return Q.all(this.scanSources().map(function(item) {
                var blockNode = this.createSourceBlockNode(item),
                    targetLevelNode = this.createTargetLevelNode(item);

                arch
                    .addParents(targetLevelNode, virtualSetNode)
                    .addChildren(targetLevelNode, [setNode, blockNode]);

                var source = blockNode.level.getPathByObj(item, item.tech);
                return QFS.exists(source).then(function(exists) {
                    if(exists) targetLevelNode.addSources(source);
                });
            }, this));
        };
    },

    /**
     * Set target node,
     * e.g. `desktop.examples`
     */
    createCollectionNode : function() {
        var arch = this.ctx.arch,
            TargetNode = registry.getNodeClass('TargetFileNode'),
            nodeid = TargetNode.createId(this);

        if(arch.hasNode(nodeid)) {
            return arch.getNode(nodeid);
        }

        var targetNode = new TargetNode({
            root : this.root,
            path : this.path
        });
        arch.setNode(targetNode);

        return targetNode;
    },

    /**
     * Creates level node for target `item`,
     * e.g. `desktop.examples/block1`
     */
    createTargetLevelNode : function(item) {
        var arch = this.ctx.arch,
            LevelNode = registry.getNodeClass('ExamplesLevelNode'),
            opts = {
                root : this.root,
                level : this.path,
                item : item,
                techName : item.tech
            },
            nodeid = LevelNode.createId(opts);

        if(arch.hasNode(nodeid)) {
            return arch.getNode(nodeid);
        }

        var levelNode = new LevelNode(opts);
        arch.setNode(levelNode);

        return levelNode;
    },

    /**
     * Creates block node (source) for `item`,
     * e.g. `desktop.examples/block1` -> `desktop.blocks/block1`
     */
    createSourceBlockNode : function(item) {
        var arch = this.ctx.arch,
            opts = {
                root : this.root,
                item : item,
                level : item.level
            },
            nodeid = BlockNode.createId(opts);

        if(arch.hasNode(nodeid)) {
            return arch.getNode(nodeid);
        }

        var blockNode = new BlockNode(opts);
        arch.setNode(blockNode);

        return blockNode;
    },

    getTechSuffixesForLevel : function(level) {
        return level.getTech(this.tech.getTechName())
            .getSuffixes()
            .map(function(suffix) {
                return '.' + suffix;
            });
    },

    getSources : function() {
        if(!this._sources) {
            var absolutivize = PATH.resolve.bind(PATH, this.root);
            this._sources = this.sources.map(function(level) {
                if(typeof level === 'string') {
                    return createLevel(absolutivize(level));
                }
                return level;
            });
        }

        return this._sources;
    },

    scanSourceLevel : function(level) {
        var relativize = PATH.relative.bind(PATH, this.root),
            suffixes = this.getTechSuffixesForLevel(level);

        return level.getItemsByIntrospection()
            .filter(function(item) {
                return ~suffixes.indexOf(item.suffix);
            })
            .map(function(item) {
                item.level = relativize(level.dir);
                return item;
            });
    },

    scanSources : function() {
        return this.getSources()
            .map(this.scanSourceLevel.bind(this))
            .reduce(function(decls, item) {
                return decls.concat(item);
            }, []);
    }

}, {

    create : function(o) {
        return new this(o);
    },

    createId : function(o) {
        return this.__base({ path : this.createPath(o) });
    },

    createPath : function(o) {
        var level = typeof o.level === 'string'?
            createLevel(PATH.resolve(o.root, o.level), {
                projectRoot: o.root
            }) :
            o.level;

        return level
            .getTech(o.techName, o.techPath)
            .getPath(this.createNodePrefix(U.extend({}, o, { level: level })));
    },

    createNodePrefix : function(o) {
        var level = typeof o.level === 'string'?
            createLevel(PATH.resolve(o.root, o.level), {
                projectRoot: o.root
            }) :
            o.level;

        return PATH.relative(o.root, level.getByObj(o.item));
    }

});

/*
registry.decl('SetsLevelNode_', 'GeneratedLevelNode', {

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
*/

};
