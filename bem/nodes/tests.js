var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    U = BEM.util;

module.exports = function(registry) {

registry.decl('TestsLevelNode', 'TargetsLevelNode', {

    __constructor : function(o) {
        this.__base(U.extend({}, o, { item : this.getTestsLevelItem(o.item) }));

        var item = this.item,
            decl = this.decl = {};

        ['block', 'elem', 'mod', 'val'].reduce(function(decl, name) {
            item[name] && (decl[name] = item[name]);
            return decl;
        }, decl);
    },

    getTestsLevelItem : function(item) {
        var tech = this.getTestsLevelTechName();

        // TODO: use `Tech#getSuffix()`
        return U.extend({}, item, {
            suffix : '.' + tech,
            tech   : tech
        });
    },

    getTestBundleName : function() {
        return this.techName.replace(/\./g, '-');
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

    createBundleNode : function(item, source) {
        var arch = this.ctx.arch,
            testContent = this.getTestContent(this.decl),
            BundleNode = registry.getNodeClass(this.bundleNodeCls),
            bundleNode = new BundleNode({
                root  : this.root,
                level : this.path,
                item  : item,
                source : source,
                envData: {
                    BundleName : this.getTestBundleName(),
                    TmplDecl : JSON.stringify(this.decl),
                    TmplContent : JSON.stringify(testContent)
                }
            });

        arch.setNode(bundleNode);

        return bundleNode;
    },

    alterArch : function() {
        var base = this.__base(),
            arch = this.ctx.arch;

        return function() {
            return Q.when(base.call(this), function(level) {
                var realLevel = PATH.join(level, '.bem/level.js'),
                    item = {
                        block : this.getTestBundleName(),
                        tech  : 'bemjson.js'
                    },
                    source = U.extend({ level : this.path }, this.item),
                    bundleNode = this.createBundleNode(item, source);

                arch
                    .addParents(bundleNode, level)
                    .addChildren(bundleNode, realLevel);

                return Q.when(this.takeSnapshot('After TestsLevelNode alterArch ' + this.getId()));
            }.bind(this));
        };
    },

    bundleNodeCls : 'TestNode'

});


registry.decl('TestNode', 'TargetBundleNode', {

    __constructor: function(o) {
        var testsEnv = JSON.parse(process.env.__tests || '{}'),
            testId = PATH.join(o.root, o.level, o.item.block),
            pageRelPath = PATH.join(o.level, o.item.block, o.item.block + '.html'),
            consoleReporter = this.consoleReporter || '',
            pageURL = this.webRoot?
                this.webRoot + pageRelPath :
                'file://' + PATH.join(o.root, pageRelPath);

        testsEnv[testId] = U.extend(testsEnv[testId] || {}, {
            consoleReporter: consoleReporter,
            pageURL: pageURL
        }, o.envData);

        // Data for 'test.bemjson.js' and 'phantomjs' technologies
        process.env.__tests = JSON.stringify(testsEnv);

        this.__base(o);
    },

    createTechNode : function(tech, bundleNode, magicNode) {
        if(tech === this.item.tech) {
            return this.createSourceItemNode(tech, bundleNode, magicNode);
        }
        return this.__base.apply(this, arguments);
    },

    createSourceItemNode : function(tech, bundleNode, magicNode) {
        tech = this.getAutogenTechName();
        return this.setBemCreateNode(
                tech,
                this.level.resolveTech(tech),
                bundleNode,
                magicNode,
                true);
    },

    'create-phantomjs-node': function(tech, bundleNode, magicNode) {
        return this.setBemCreateNode(
            tech,
            this.level.resolveTech(tech),
            bundleNode,
            magicNode,
            true);
    },

    getAutogenTechName : function() {
        return 'test.bemjson.js';
    }

});

};
