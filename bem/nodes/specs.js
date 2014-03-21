var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    U = BEM.util;

module.exports = function(registry) {

registry.decl('SetNode', {

    'create-specs-node' : function(item, sourceNode, setNode) {
        return this.createLevelNode(item, sourceNode, setNode, 'SpecsLevelNode');
    }

});

registry.decl('SpecsLevelNode', 'TargetLevelNode', {

    __constructor : function(o) {
        U.extend({}, o.item, { suffix : '.specs', tech : 'spec' });

        this.__base(o);

        var item = this.item,
            decl = this.decl = {};

        ['block', 'elem', 'mod', 'val'].reduce(function(decl, name) {
            item[name] && (decl[name] = item[name]);
            return decl;
        }, decl);
    },

    getProtoLevelName : function() {
        return 'specs-set';
    },

    getSpecContent : function(item) {
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
            content = this.getSpecContent(this.decl),
            BundleNode = registry.getNodeClass(this.getBundleNodeClassName()),
            opts = {
                root  : this.root,
                level : this.path,
                item  : item,
                source : source,
                envData: {
                    BundleName : item.block,
                    TmplDecl : JSON.stringify(this.decl),
                    TmplContent : JSON.stringify(content)
                }
            };

        if(arch.hasNode(BundleNode.createId(opts))) {
            return null;
        }

        var bundleNode = BundleNode.create(opts);
        arch.setNode(bundleNode);

        return bundleNode;
    },

    alterArch : function() {
        var base = this.__base(),
            arch = this.ctx.arch;

        return function() {
            return Q.when(base.call(this), function(level) {
                var realLevel = PATH.join(level, '.bem/level.js');

                this.sources.forEach(function(source) {
                    var suffix = source.suffix.slice(1),
                        item = {
                            block : suffix.replace(/\./g, '-')
                        },
                        sourceItem = U.extend({ level : this.path }, this.item),
                        bundleNode = this.createBundleNode(item, sourceItem);

                    if(bundleNode) {
                        arch
                            .addParents(bundleNode, level)
                            .addChildren(bundleNode, [realLevel, this]);
                    }
                }, this);

                return Q.when(this.takeSnapshot('After SpecsLevelNode alterArch ' + this.getId()));
            }.bind(this));
        };
    },

    getBundleNodeClassName : function() {
        return 'SpecNode';
    }

});

registry.decl('SpecNode', 'TargetBundleNode', {

    __constructor: function(o) {
        o.item.tech = 'bemjson.js';

        var testsEnv = JSON.parse(process.env.__tests || '{}'),
            testId = PATH.join(o.root, o.level, o.item.block),
            pageRelPath = PATH.join(o.level, o.item.block, o.item.block + '.html'),
            consoleReporter = this.consoleReporter || '',
            pageURL = this.webRoot?
                this.webRoot + pageRelPath :
                'file://' + PATH.join(o.root, pageRelPath);

        testsEnv[testId] = U.extend(testsEnv[testId] || {}, {
            consoleReporter : consoleReporter,
            pageURL : pageURL
        }, o.envData);

        // Data for 'spec.bemjson.js' and 'phantomjs' technologies
        process.env.__tests = JSON.stringify(testsEnv);

        this.__base(o);
    },

    createTechNode : function(tech, bundleNode, magicNode) {
        if(tech === this.item.tech) {
            // Use `spec.bemjson.js` tech instead of `bemjson.js`
            return this.createSourceItemNode(tech, bundleNode, magicNode);
        }
        return this.__base.apply(this, arguments);
    },

    createSourceItemNode : function(tech, bundleNode, magicNode) {
        tech = 'spec.bemjson.js';
        return this['create-' + tech + '-node'](tech, bundleNode, magicNode);
    },

    'create-spec.bemjson.js-node' : function(tech, bundleNode, magicNode) {
        return this.setBemCreateNode(
            tech,
            this.level.resolveTech(tech),
            bundleNode,
            magicNode,
            true);
    },

    'create-phantomjs-node' : function(tech, bundleNode, magicNode) {
        var arch = this.ctx.arch,
            nodes = this.setBemCreateNode(
                tech,
                this.level.resolveTech(tech),
                bundleNode,
                magicNode,
                true,
                false);

        function getBorchikNodeId(file) {
            return PATH.join(PATH.dirname(file), '_' + PATH.basename(file));
        }

        ['css', 'spec.js'].forEach(function(tech) {
            var bundlePath = this.getBundlePath(tech);
            if(!arch.hasNode(bundlePath)) return;

            // NOTE: linking phantomjs node with optimised files, e.g. `_index.spec.js`,
            // so they would be built before PhantomJS would run.
            arch.link(getBorchikNodeId(bundlePath), nodes);
        }, this);

        return nodes;
    },

    'create-spec.js+browser.js+bemhtml-node' : function(tech, bundleNode, magicNode) {
        return this.setBemBuildNode(
            tech,
            this.level.resolveTech(tech),
            this.getBundlePath('deps.js'),
            bundleNode,
            magicNode,
            true);      // NOTE: override
    },

    'create-spec.js-optimizer-node' : function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    },

    'create-spec.js+browser.js+bemhtml-optimizer-node' : function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    }

});

};
