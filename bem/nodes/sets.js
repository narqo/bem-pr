/**
 * @fileOverview Узлы для сборки наборов БЭМ-сущностей (sets)
 */

var BEM = require('bem'),
    PATH = require('path'),
    FS = require('fs'),

    Q = BEM.require('qq'),
    QFS = BEM.require('q-fs'),
    LOGGER = BEM.require('./logger'),
    U = BEM.require('./util'),
    registry = BEM.require('./nodesregistry'),

    nodes = BEM.require('./nodes/node'),
    magicNodes = BEM.require('./nodes/magic'),
    blockNodes = BEM.require('./nodes/block'),
    bundleNodes = BEM.require('./nodes/bundle'),
    createNodes = BEM.require('./nodes/create'),
    fileNodes = BEM.require('./nodes/file'),

    // XXX: monkey-patching
    monkeyNodes = require('./monkey'),

    SetsNodeName = exports.SetsNodeName = 'SetsNode',
    SetsLevelNodeName = exports.SetsLevelNodeName = 'SetsLevelNode',
    ExamplesLevelNodeName = exports.ExamplesLevelNodeName = 'ExamplesLevelNode',
    TestsLevelNodeName = exports.TestsLevelNodeName = 'TestsLevelNode',
//    AllTestsLevelNodeName = exports.AllTestsLevelNodeName = 'AllTestsLevelNode',
    ExampleSourceNodeName = exports.ExampleSourceNodeName = 'ExampleSourceNode',
//    AutogenTestSourceNodeName = exports.AutogenTestSourceNodeName = 'AutogenTestSourceNode',
    ExampleNodeName = exports.ExampleNodeName = 'ExampleNode',
    TestNodeName = exports.TestNodeName = 'TestNode',

    /** Id главного узла сборки наборов */
    SETS_NODE_ID = 'sets',

    createLevel = BEM.createLevel;


Object.defineProperty(exports, SetsNodeName, {
    get : function() { return registry.getNodeClass(SetsNodeName) }
});


registry.decl(SetsNodeName, nodes.NodeName, {

    __constructor : function(o) {
         this.__base(o);

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
        var node = new nodes.Node(SETS_NODE_ID);
        this.arch.setNode(node, parent);

        return node.getId();
    },

    createSetsLevelNodes : function(parents, children) {
        var sets = this.getSets();
        return Object.keys(sets).map(function(name) {

            var node = registry.getNodeClass(SetsLevelNodeName).create({
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


var GeneratedLevelNodeName = 'GeneratedLevelNode';

registry.decl(GeneratedLevelNodeName, magicNodes.MagicNodeName, {

    __constructor : function(o) {
        Object.defineProperty(this, 'level', {
            get : function() {
                if(typeof this._level === 'string') {
                    this._level = createLevel(PATH.resolve(this.root, this._level));
                }
                return this._level;
            },
            set : function(level) {
                this._level = level;
            }
        });

        this.level = o.level;
        this.item = o.item;
        this.techName = o.item.tech;
        this.sources = o.sources || [];

        this.__base(U.extend({ path : this.__self.createPath(o) }, o));

        this.rootLevel = createLevel(this.root);
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    /**
     * @returns {Function}
     */
    alterArch : function() {

        var ctx = this.ctx;

        return function() {
            var arch = ctx.arch,
                snapshot1 = this.takeSnapshot('Before GeneratedLevelNode alterArch'),
                CreateLevelNode = registry.getNodeClass(CreateLeveNodeName),
                opts = {
                    root     : this.root,
                    level    : this.level,
                    item     : this.item,
                    techName : this.techName
                },
                path = CreateLevelNode.createPath(opts),
                levelNode;

            if(arch.hasNode(path)) {
                levelNode = arch.getNode(path);
            } else {
                levelNode = this.useFileOrBuild(new CreateLevelNode(opts));
                arch.addParents(levelNode, arch.getParents(this));
            }

            return Q.all([snapshot1, this.takeSnapshot('After GeneratedLevelNode alterArch ' + this.getId())])
                .then(function() {
                    return levelNode.getId();
                });
        };

    },

    useFileOrBuild : function(node) {
        var arch = this.ctx.arch,
            fileNode = new fileNodes.FileNode({
                root : this.root,
                path : node.path
            });

        arch.setNode(fileNode);

        if(FS.existsSync(node.getPath())) {
            return fileNode;
        }

        arch.setNode(node)
            .addParents(node, fileNode);

        return fileNode;
    },

    getSourceItemTechs : function() {
        return [];
    },

    getTechSuffixesForLevel : function(level) {
        return this.getSourceItemTechs()
            .reduce(function(techs, tech) {
                [].push.apply(techs, level.getTech(tech).getSuffixes());
                return techs;
            }, [])
            .map(function(suffix) {
                return '.' + suffix;
            });
    },

    getSources : function() {
        if(!this._sources) {
            var absolutivize = PATH.resolve.bind(null, this.root);
            this._sources = this.sources.map(function(level) {
                if(typeof level === 'string')
                    return createLevel(absolutivize(level));
                return level;
            });
        }

        return this._sources;
    },

    scanSources : function() {
        return this.getSources()
            .map(this.scanSourceLevel.bind(this))
            .reduce(function(decls, item) {
                return decls.concat(item);
            }, []);
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
                // XXX: key?
                item.key = serializeBemItem(item.level, item);
                return item;
            });
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
            createLevel(PATH.resolve(o.root, o.level), { noCache: true }) :
            o.level;

        return level
            .getTech(o.item.tech)
            .getPath(this.createNodePrefix(U.extend({}, o, { level: level })));
    },

    createNodePrefix : function(o) {
        var level = typeof o.level === 'string'?
                createLevel(PATH.resolve(o.root, o.level)) :
                o.level;

        return PATH.relative(o.root, level.getByObj(o.item));
    }

});


var CreateLeveNodeName = 'CreateLevelNode';

registry.decl(CreateLeveNodeName, createNodes.BemCreateNodeName, {

    make : function() {
        return this.__base.apply(this, arguments)
            .then(function() {
                // XXX: dropping level path cache (tech/v2)
                createLevel(this.getPath(), { noCache : true });
            }.bind(this));
    }

}, {

    createId : function(o) {
        return this.createLevelPath(o);
    },

    createLevelPath : function() {
        return PATH.join(this.createPath.apply(this, arguments), '.bem', 'level.js');
    }

});


registry.decl(SetsLevelNodeName, GeneratedLevelNodeName, {

    /**
     * @returns {Function}
     */
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
                        blocknid = blockNodes.BlockNode.createId(o);

                    if(arch.hasNode(blocknid)) {
                        blockNode = arch.getNode(blocknid);
                    } else {
                        blockNode = new blockNodes.BlockNode(o);
                        arch.setNode(blockNode);
                    }

                    // creating levels node for item (examples/tests/whatever)
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

                // FIXME: hack
//                if(_t.getSourceItemTechs().indexOf('test.js') > -1) {
//                    arch.setNode(
//                        registry.getNodeClass(AllTestsLevelNodeName).create({
//                            root : _t.root,
//                            level : _t.path,
//                            sources : _t.sources
//                        }),
//                        setLevelNode);
//                }

                return Q.when(_t.takeSnapshot('After SetsLevelNode alterArch ' + _t.getId()));
            });

        };

    },

    getSourceItemTechs : function() {
        return [
            'examples',
            'tests',
            'test.js'
        ];
    },

    getNodeClsForSuffix : function(suffix) {
        return {
            '.examples' : ExamplesLevelNodeName,
            '.tests'    : TestsLevelNodeName,
            '.test.js'  : TestsLevelNodeName
        }[suffix];
    }

});


registry.decl(ExamplesLevelNodeName, GeneratedLevelNodeName, {

    /**
     * @returns {Function}
     */
    alterArch : function() {

        var base = this.__base();
        return function() {

            var _t = this,
                arch = _t.ctx.arch;

            return Q.when(base.call(_t), function(level) {
                var realLevel = arch.getChildren(level),
                    decls = _t.scanSources();

                decls.forEach(function(item) {
                    var bundleNode = registry.getNodeClass(this.bundleNodeCls).create({
                        root   : this.root,
                        level  : this.path,
                        item   : U.extend({}, item),
                        source : item
                    });

                    arch.setNode(bundleNode, level, realLevel);
                }, _t);

                return Q.when(_t.takeSnapshot('After ExamplesLevelNode alterArch ' + _t.getId()));
            });

        };

    },

    getSourceItemTechs : function() {
        return ['bemjson.js'];
    },

    bundleNodeCls : ExampleNodeName

});


registry.decl(TestsLevelNodeName, GeneratedLevelNodeName, {

    __constructor : function(o) {
        this.__base(U.extend({}, o, { item : this.getTestsLevelItem(o.item) }));
    },

    getTestsLevelItem : function(item) {
        var tech = this.getTestsLevelTechName();

        // TODO: use `Tech#getSuffix()`
        return U.extend({}, item, {
            suffix : '.' + tech,
            tech   : tech
        });
    },

    getAutogenTestBundleName: function() {
        return 'default';
    },

    getTestsLevelTechName: function() {
        return 'tests';
    },

    alterArch : function() {

        var base = this.__base();
        return function() {

            var _t = this,
                arch = this.ctx.arch;

            return Q.when(base.call(this), function(level) {
                var realLevel = arch.getChildren(level),
                    item = {
                        block : this.getAutogenTestBundleName(),
                        tech  : 'bemjson.js'
                    },
                    source = U.extend({ level : this.path }, _t.item),
                    testContent = ['block', 'elem', 'mod', 'val'].reduce(function(obj, key) {
                        obj[key] = _t.item[key];
                        return obj;
                    }, {}),
                    bundleNode = registry.getNodeClass(this.bundleNodeCls).create({
                        root  : this.root,
                        level : this.path,
                        item  : item,
                        source : source,
                        envData: {
                            BundleName : _t.getAutogenTestBundleName(),
                            TmplContent : JSON.stringify(testContent)
                        }
                    });

                arch.setNode(bundleNode, level, realLevel);

                return Q.when(_t.takeSnapshot('After TestsLevelNode alterArch ' + _t.getId()));
            }.bind(this));

        };
    },

    bundleNodeCls : TestNodeName

}, {

    create: function(o) {
        return new this(o);
    }

});


// TODO: выяснить, пользуется ли кто-нибудь этим
//registry.decl(AllTestsLevelNodeName, TestsLevelNodeName, {
//
//    __constructor : function(o) {
//        this.__base(U.extend({
//            item : { block : this.getAllTestsLevelName() }
//        }, o));
//    },
//
//    getAllTestsLevelName : function() {
//        return 'all';
//    },
//
//    alterArch: function() {
//        var ctx = this.ctx,
//            base = this.__base();
//
//        return function() {
//
//            var _t = this,
//                arch = ctx.arch;
//
//            return Q.when(base.call(this), function(levelNode) {
//
//                var bundleName = _t.getAutogenTestBundleName(),
//                    o = {
//                        root  : _t.root,
//                        level : _t.path,
//                        item  : { block: bundleName, tech : 'bemjson.js' }
//                    },
//
////                    autogenTestContent = _t.getBemjsonDecl(_t.getSourcesItems('test.js')),
////                    srcNode = registry.getNodeClass(AutogenTestSourceNodeName).create(o),
//
//                    bundleNode = registry.getNodeClass(TestNodeName).create(U.extend({}, o, {
//                        source : _t.item.level,
//                        envData: {
//                            BundleName: bundleName,
//                            TmplContent: JSON.stringify(autogenTestContent, null, 4)
//                        }
//                    }));
//
//                arch.setNode(bundleNode, levelNode)
////                    .setNode(srcNode, bundleNode);
//
//                return Q.when(_t.takeSnapshot('After AllTestsLevelNode alterArch ' + _t.getId()))
//            });
//
//        };
//    },
//
//    getBemjsonDecl: function(items) {
//        return items.map(function(item) {
//            return ['block', 'elem', 'mod', 'val'].reduce(function(obj, key) {
//                obj[key] = item[key];
//                return obj;
//            }, {});
//        });
//    },
//
//    getSourcesItems: function(tech) {
//        var absolutivize = PATH.resolve.bind(null, this.root),
//            rslt = [];
//
//        this.sources.map(function(source) {
//            if(typeof source === 'string') {
//                source = createLevel(absolutivize(source));
//            }
//            return this.getSourceItems(source, tech);
//        }, this).forEach(function (item) {
//            rslt = rslt.concat(item);
//        });
//
//        return rslt;
//    },
//
//    getSourceItems: function(level, tech) {
//        return level.getItemsByIntrospection().filter(function(item) {
//            return item.tech == tech;
//        });
//    }
//
//});


registry.decl(ExampleSourceNodeName, fileNodes.GeneratedFileNodeName, {

    __constructor : function(o) {
        var self = this.__self;

        this.level = typeof o.level === 'string'?
            createLevel(PATH.resolve(o.root, o.level)) :
            o.level;

        this.item = o.item;
        this.source = self.createPath({
            root : o.root,
            level : o.source.level,
            item : o.source
        });

        this.__base(U.extend({ path: self.createPath(o) }, o));
    },

    make : function() {
        var _t = this,
            path = _t.getPath();

        return QFS.makeTree(PATH.dirname(path))
            .then(function() {
                return U.readFile(PATH.resolve(_t.root, _t.source));
            })
            .then(function(data) {
                return U.writeFileIfDiffers(path, data);
            });
    }

}, {

    create : function(o) {
        return new this(o);
    },

    createPath : function(o) {
        var level = typeof o.level === 'string'?
                createLevel(PATH.resolve(o.root, o.level)) :
                o.level;

        return level
            .getTech(o.item.tech)
            .getPath(this.createNodePrefix(o));
    },

    createNodePrefix : function(o) {
        var level = typeof o.level === 'string'?
                createLevel(PATH.resolve(o.root, o.level)) :
                o.level;

        return PATH.relative(o.root, level.getByObj(o.item));
    }

});


//registry.decl(AutogenTestSourceNodeName, ExampleSourceNodeName, {
//
//    make: function() {
//        this.level = createLevel(this.level.dir, { noCache : true });
//
//        var techName = this.getAutogenTechName(),
//            techPath = this.level.resolveTech(techName);
//
//        this.tech = this.level.getTech(techName, techPath);
//        console.log(this.tech);
//
//        var opts = {
//                forceTech : this.tech.getTechPath(),
//                level : this.level.dir,
//                force : true
//            },
//            // FIXME: hardcode
//            args = { names: this.item.block };
//
//        return BEM.api.create.block(opts, args);
//    },
//
//    getAutogenTechName : function() {
//        return 'test-tmpl';
//    }
//
//});


registry.decl(ExampleNodeName, bundleNodes.BundleNodeName, {

    __constructor : function(o) {
        this.__base(o);

        this.rootLevel = createLevel(this.root);
        this.source = o.source;
    },

    getTechs : function() {
        return this.__base.apply(this, arguments);
    },

    getSourceNodePrefix : function() {
        if(!this._sourceNodePrefix) {
            this._sourceNodePrefix = this.__self.createNodePrefix({
                root  : this.root,
                level : this.source.level,
                item  : this.item
            });
        }

        return this._sourceNodePrefix;
    },

    getLevels : function(tech) {
        return this.__base.apply(this, arguments)
            .concat([this.rootLevel.getTech('blocks').getPath(this.getSourceNodePrefix())]);
    },

    createTechNode : function(tech, bundleNode, magicNode) {
        if(tech === this.item.tech) {
            return this.setSourceItemNode(tech, bundleNode, magicNode);
        }
        return this.__base.apply(this, arguments);
    },

    setSourceItemNode : function(tech, bundleNode, magicNode) {
        LOGGER.fdebug('Going to create source node for tech %s', tech);

        var arch = this.ctx.arch,
            node = this.createSourceNode(),
            upstreamNode = this.createUpstreamNode();

        bundleNode && arch.addParents(node, bundleNode);
        magicNodes && arch.addChildren(node, magicNode);
        upstreamNode && arch.addChildren(node, upstreamNode);

        return node;
    },

    createSourceNode : function() {
        var node = this.useFileOrBuild(registry.getNodeClass(ExampleSourceNodeName).create({
                root   : this.root,
                level  : this.level,
                item   : this.item,
                source : this.source
            }));

        this.ctx.arch.setNode(node);

        return node;
    },

    createUpstreamNode : function() {
        var filePath = registry.getNodeClass(ExampleSourceNodeName).createPath({
            root  : this.root,
            level : this.source.level,
            item  : this.source
        });

        if(!FS.existsSync(PATH.resolve(this.root, filePath))) {
            return;
        }

        var node = new fileNodes.FileNode({
            root: this.root,
            path: filePath
        });

        this.ctx.arch.setNode(node);

        return node;
    }

}, {

    create : function(o) {
        return new this(o);
    }

});


registry.decl(TestNodeName, ExampleNodeName, {

    __constructor: function(o) {
        var testsEnv = JSON.parse(process.env.__tests || '{}'),
            testId = PATH.join(o.root, o.level, o.item.block),
            pageRelPath = PATH.join(o.level, o.item.block, o.item.block + '.html'),
            consoleReporter = this.consoleReporter || '',
            pageURL;

        if(this.webRoot) {
            pageURL = this.webRoot + pageRelPath;
        } else {
            pageURL = 'file://' + PATH.join(o.root, pageRelPath);
        }

        testsEnv[testId] = U.extend(testsEnv[testId] || {}, {
            consoleReporter: consoleReporter,
            pageURL: pageURL
        }, o.envData);

        // Data for 'test-tmpl' and 'phantomjs' technologies
        process.env.__tests = JSON.stringify(testsEnv);

        this.__base(o);
    },

    setSourceItemNode : function(tech, bundleNode, magicNode) {
        tech = this.getAutogenTechName();

        return this.setBemCreateNode(
                tech,
                this.level.resolveTech(tech),
                bundleNode,
                magicNode,
                true);

//        var node = this.useFileOrBuild(registry.getNodeClass(AutogenTestSourceNodeName).create({
//                root   : this.root,
//                level  : this.level,
//                item   : this.item,
//                source : this.source
//            }));
//
//        this.ctx.arch.setNode(node);
//        bundleNode && this.ctx.arch.addParents(node, bundleNode);
//
//        console.log(this.ctx.arch.toString());
//
//        return node;
    },

    getAutogenTechName : function() {
        return 'test-tmpl';
    }

});


function serializeBemItem() {
    return [].splice.call(arguments, 0)
        .reduce(function(keys, item) {

            if(typeof item === 'string') {
                item = item.trim();
                if(!item)
                    return keys;
                item = { block : item };
            }

            keys.push(U.bemKey(item));
            return keys;

        }, [])
        .join('/');
}

function parseBemItem(key) {
    return (key + '').split('/').map(function(part) {
            return U.bemParseKey(part);
        });
}
