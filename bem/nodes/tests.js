var PATH = require('path'),
    BEM = require('bem'),
    registry = require('bem/lib/nodesregistry'),
    Q = require('bem/node_modules/q'),
    commonNodes = require('./common'),
    examplesNodes = require('./examples'),
    /* exports */
    TestsLevelNodeName = exports.TestsLevelNodeName = 'TestsLevelNode',
    TestNodeName = exports.TestNodeName = 'TestNode',
    U = BEM.util;


registry.decl(TestsLevelNodeName, commonNodes.GeneratedLevelNodeName, {

    __constructor : function(o) {
        this.__base(U.extend({}, o, { item : this.getTestsLevelItem(o.item) }));

        var item = this.item;
        this.decl = ['block', 'elem', 'mod', 'val'].reduce(function(decl, name) {
            item[name] && (decl[name] = item[name]);
            return decl;
        }, {});
    },

    getTestsLevelItem : function(item) {
        var tech = this.getTestsLevelTechName();

        // TODO: use `Tech#getSuffix()`
        return U.extend({}, item, {
            suffix : '.' + tech,
            tech   : tech
        });
    },

    getAutogenTestBundleName : function() {
        return 'default';
    },

    getTestsLevelTechName : function() {
        return 'tests';
    },

    getTestContent : function(item) {
        var normalized = {
                block : item.block
            },
            isElem = false;

        if(item.elem) {
            isElem = true;
            normalized.elem = item.elem;
        }

        if(item.mod) {
            var tmods = normalized[isElem? 'elemMods' : 'mods'] = {};
            tmods[item.mod] = item.val || '';
        }

        return normalized;
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
                    source = U.extend({ level : this.path }, this.item),
                    testContent = this.getTestContent(this.decl),
                    bundleNode = registry.getNodeClass(this.bundleNodeCls).create({
                        root  : this.root,
                        level : this.path,
                        item  : item,
                        source : source,
                        envData: {
                            BundleName : _t.getAutogenTestBundleName(),
                            TmplDecl : JSON.stringify(this.decl),
                            TmplContent : JSON.stringify(testContent)
                        }
                    });

                arch.setNode(bundleNode, level, realLevel);

                return Q.when(_t.takeSnapshot('After TestsLevelNode alterArch ' + _t.getId()));
            }.bind(this));
        };
    },

    bundleNodeCls : TestNodeName

});


registry.decl(TestNodeName, examplesNodes.ExampleNodeName, {

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
    },

    getAutogenTechName : function() {
        return 'test-tmpl';
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
//
//
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
