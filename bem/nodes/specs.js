var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    U = BEM.util;

module.exports = function(registry) {

registry.decl('SpecsLevelNode', 'TargetsLevelNode', {

    __constructor : function(o) {
        U.extend({}, o.item, { suffix : '.specs', tech : 'spec' });
        this.__base(o);
    },

    getSpecsLevelItem : function(item) {
        var tech = this.getSpecsLevelTechName();

        // TODO: use `Tech#getSuffix()`
        return U.extend({}, item, {
            suffix : '.' + tech,
            tech : tech
        });
    },

    getSpecsLevelTechName : function() {
        return 'specs';
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
            BundleNode = registry.getNodeClass(this.getBundleNodeClassName()),
            opts = {
                root  : this.root,
                level : this.path,
                item  : item,
                source : source,
                envData : {
                    BundleName : item.block,
                    TmplContent : JSON.stringify(this.getSpecContent(this.item))
                }
            };

        if(arch.hasNode(BundleNode.createId(opts))) {
            return null;
        }

        var bundleNode = new BundleNode(opts);
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
                        block : this.techName.replace(/\./g, '-')
                    },
                    source = U.extend({ level : this.path }, this.item),
                    bundleNode = this.createBundleNode(item, source);

                if(bundleNode) {
                    arch
                        .addParents(bundleNode, level)
                        .addChildren(bundleNode, [realLevel, this]);
                }

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
            testId = PATH.join(o.root, o.level, o.item.block);

        testsEnv[testId] = U.extend(testsEnv[testId] || {}, o.envData);

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
        return this.setBemCreateNode(
            tech,
            this.level.resolveTech(tech),
            bundleNode,
            magicNode,
            true,
            false);    // FIXME: false because of http://github.com/bem/bem-tools#527
    },

    'create-spec.js+browser.js+bemhtml-node' : function(tech, bundleNode, magicNode) {
        return this.setBemBuildNode(
            tech,
            this.level.resolveTech(tech),
            this.getBundlePath('deps.js'),
            bundleNode,
            magicNode,
            true);      // NOTE: <- override
    },

    'create-spec.js-optimizer-node' : function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    },

    'create-spec.js+browser.js+bemhtml-optimizer-node' : function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    }

});

};
