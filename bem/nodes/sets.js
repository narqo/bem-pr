/**
 * @fileOverview Узлы для сборки наборов БЭМ-сущностей (sets)
 */

var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    Q = BEM.require('qq'),
    _ = BEM.require('underscore'),
    LOGGER = BEM.require('./logger'),
    createLevel = BEM.createLevel;

module.exports = function(registry) {

registry.decl('SetsNode', 'Node', {

    __constructor : function(o) {
        this.__base(o);

        this.setNodeId = 'sets';

        this.arch = o.arch;
        this.root = o.root;
        this.rootLevel = createLevel(this.root);
    },

    alterArch : function(parent, children) {
        var _t = this,
            arch = _t.arch;

        return Q.step(
            function() {
                return Q.call(_t.createCommonSetsNode, _t, parent);
            },
            function(common) {
                return [
                    common,
                    Q.call(_t.createSetsLevelNodes, _t,
                        parent? [common].concat(parent) : common, children)
                ];
            })
            .then(function() {
                return arch;
            })
            .fail(LOGGER.error);
    },

    createCommonSetsNode : function(parent) {
        var node = new registry.getNodeClass('Node').create(this.setNodeId);
        this.arch.setNode(node, parent);

        return node.getId();
    },

    createSetsLevelNodes : function(parents, children) {
        var sets = this.getSets();
        return Object.keys(sets).map(function(name) {

            var node = registry.getNodeClass('SetsLevelNode').create({
                root    : this.root,
                level   : this.rootLevel,
                item    : { block : name, tech : 'sets' },
                sources : sets[name]
            });

            this.arch.setNode(node);

            parents && this.arch.addParents(node, parents);
            children && this.arch.addChildren(node, children);

            return node.getId();

        }, this);
    },

    /**
     * @returns {Object} Описание наборов `{ name : [level1, level2] }`
     */
    getSets : function() {
        return { };
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
                    BlockNode = registry.getNodeClass('BlockNode'),
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
                        blockNode = BlockNode.create(o);
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
            tests    : ['tests', 'test.js'],
            docs     : ['md', 'wiki']
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
