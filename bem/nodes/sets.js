var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    createLevel = BEM.createLevel,
    logger = BEM.logger,
    U = BEM.util;

module.exports = function(registry) {

var Node = registry.getNodeClass('Node'),
    FileNode = registry.getNodeClass('FileNode'),
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
            SetNode = registry.getNodeClass('SetNode'),
            sets = this.getSets(),
            setLevesCollection = [],
            levelsNodes, node;

        // zip sets and source techs into set collection
        Object.keys(sets).reduce(function(nodes, setName) {
            levelsNodes = this.getSourceTechs(setName).map(function(techName) {
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
     * Sets description
     *
     * - `{ setName : [...sourceLevels] }`
     *
     * @example
     *   { desktop : ['common.blocks', 'desktop.blocks'] }
     *
     * @returns {Object}
     * @protected
     */
    getSets : function() {
        return {};
    },

    /**
     * Tech names list for sources in `setName` set
     *
     * - `['examples']` for `common.blocks/b1/b1.examples` source of `desktop` set
     * - `['specs']` for `desktop.blocks/b2/b2.spec.js` source of `desktop` set
     *
     * @param {String} setName
     * @returns {Array}
     * @protected
     */
    getSourceTechs : function(setName) {
        return [];
    }

}, {

    create : function(o) {
        return new this(o);
    }

});


registry.decl('SetNode', 'MagicNode', {

    __constructor : function(o) {
        this.item = o.item;
        this.sources = o.sources || [];

        var level = this.level = o.level,
            techs = this.getTechs(o.techName) || [o.techName];

        this.techs = techs.map(function(techName) {
            return level.getTech(techName);
        }, this);

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
                aliasSetNode;

            if(arch.hasNode(this.path)) {
                aliasSetNode = arch.getNode(this.path);
            } else {
                aliasSetNode = new Node(this.path);
                arch.setNode(aliasSetNode, arch.getParents(this), setNode);
            }

            this.scanSources().map(function(item) {
                var blockNode = this.createSourceBlockNode(item),
                    targetLevelNode = this.createTargetLevelNode(item, blockNode, setNode);

                arch
                    .addParents(targetLevelNode, aliasSetNode)
                    .addChildren(targetLevelNode, [setNode, blockNode]);
            }, this);
        };
    },

    /**
     * Set target node,
     * e.g. `desktop.examples`
     */
    createCollectionNode : function() {
        var arch = this.ctx.arch,
            TargetNode = registry.getNodeClass('TargetNode'),
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
    createTargetLevelNode : function(item, sourceNode, collectionNode) {
        var tech = item.tech,
            createLevelNodeFn = 'create-' + tech + '-node';

        if(typeof this[createLevelNodeFn] !== 'function') {
            createLevelNodeFn = 'createLevelNode';
        }

        return this[createLevelNodeFn].apply(this, arguments);
    },

    createLevelNode : function(item, sourceNode, collectionNode, levelNodeClass) {
        if(!levelNodeClass) {
            levelNodeClass = 'GeneratedLevelNode';
        }

        var arch = this.ctx.arch,
            LevelNode = registry.getNodeClass(levelNodeClass),
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

        var source = sourceNode.level.getPathByObj(item, item.tech);
        if(FS.existsSync(source)) {
            opts.sources = [PATH.relative(this.root, source)];
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

    getTechs : function(techName) {
        switch(techName) {

        case 'specs':
            return ['specs', 'spec.js'];

        case 'docs':
            return ['md', 'wiki'];

//        case 'tests':
//            return ['tests'];
//
//        case 'examples':
//            return ['examples'];

        }

        return [techName];
    },

    getTechSuffixesForLevel : function(level) {
        var suffixes = [];

        this.techs.forEach(function(tech) {
            var techName = tech.getTechName(),
                levelSuffixes = level.getTech(techName)
                    .getSuffixes()
                    .map(function(suffix) {
                        return '.' + suffix;
                    });
            Array.prototype.push.apply(suffixes, levelSuffixes);
        });

        return suffixes;
    },

    getSources : function() {
        if(!this._sources) {
            var absolutivize = PATH.resolve.bind(null, this.root);
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
        var relativize = PATH.relative.bind(null, this.root),
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
    },

    'create-examples-node' : function(item, sourceNode, collectionNode) {
        return this.createLevelNode(item, sourceNode, collectionNode, 'ExamplesLevelNode');
    },

    'create-specs-node' : function(item, sourceNode, collectionNode) {
        return this.createLevelNode(item, sourceNode, collectionNode, 'SpecsLevelNode');
    },

    'create-spec.js-node' : function(item, sourceNode, collectionNode) {
        return this['create-specs-node'].apply(this, arguments);
    },

    'create-spec.js+browser.js+bemhtml-node' : function(item, sourceNode, collectionNode) {
        return this['create-specs-node'].apply(this, arguments);
    }

}, {

    createId : function(o) {
        return this.__base({ path : this.createPath(o) });
    },

    createPath : function(o) {
        var level = typeof o.level === 'string'?
            createLevel(PATH.resolve(o.root, o.level), {
                    projectRoot : o.root
                }) :
            o.level;

        return level
            .getTech(o.techName, o.techPath)
            .getPath(this.createNodePrefix(U.extend({}, o, { level: level })));
    },

    createNodePrefix : function(o) {
        var level = typeof o.level === 'string'?
            createLevel(PATH.resolve(o.root, o.level), {
                    projectRoot : o.root
                }) :
            o.level;

        return PATH.relative(o.root, level.getByObj(o.item));
    }

});

};
