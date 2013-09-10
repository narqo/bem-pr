var PATH = require('path'),
    BEM = require('bem'),
    Q = require('bem/node_modules/q'),
    U = BEM.util;

module.exports = function(registry) {

registry.decl('TestsLevelNode', 'GeneratedLevelNode', {

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

    bundleNodeCls : 'TestNode'

});


registry.decl('TestNode', 'ExampleNode', {

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

};
