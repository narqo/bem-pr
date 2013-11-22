var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    LOGGER = require('bem/lib/logger'),
    U = BEM.util,
    createLevel = BEM.createLevel;

module.exports = function(registry) {

registry.decl('ExamplesLevelNode', 'GeneratedLevelNode', {

    /**
     * @returns {Function}
     */
    alterArch : function() {

        var base = this.__base();
        return function() {

            var _t = this,
                arch = _t.ctx.arch;

            return Q.when(base.call(_t), function(level) {
                var realLevel = PATH.join(level, '.bem', 'level.js'),
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

    bundleNodeCls : 'ExampleNode'

});


registry.decl('ExampleNode', 'BundleNode', {

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
            .concat(
                this.rootLevel
                    .getTech('blocks')
                    .getPath(this.getSourceNodePrefix())
            );
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
        magicNode && arch.addChildren(node, magicNode);
        upstreamNode && arch.addChildren(node, upstreamNode);

        return node;
    },

    createSourceNode : function() {
        var node = this.useFileOrBuild(registry.getNodeClass('ExampleSourceNode').create({
                root   : this.root,
                level  : this.level,
                item   : this.item,
                source : this.source
            }));

        this.ctx.arch.setNode(node);

        return node;
    },

    createUpstreamNode : function() {
        var filePath = registry.getNodeClass('ExampleSourceNode').createPath({
                root  : this.root,
                level : this.source.level,
                item  : this.source
            }),
            node = new registry.getNodeClass('FileNode').create({
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


registry.decl('ExampleSourceNode', 'GeneratedFileNode', {

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

};
