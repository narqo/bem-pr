var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    MD = require('marked'),
    U = BEM.util,
    createLevel = BEM.createLevel;

module.exports = function(registry) {

registry.decl('SetNode', {

    'create-docs-node' : function(item, sourceNode, setNode) {
        return this.createLevelNode(item, sourceNode, setNode, 'DocsLevelNode');
    }

});

registry.decl('DocsLevelNode', 'TargetLevelNode', {

    __constructor : function(o) {
        this.__base(o);
        this._bundleNodeClass = registry.getNodeClass(this.getBundleNodeClass());
        this._fileNodeClass = registry.getNodeClass('FileNode');
    },

    /*
    make : function() {
        return this.__base.apply(this, arguments)
            .then(function() { console.log(this.ctx.arch.toString()) }.bind(this));
    },
    */

    alterArch : function() {
        var base = this.__base();
        return function() {
            return Q.when(base.call(this), function(level) {
                this.sources.forEach(function(item) {
                    this.createBundleNode(item, level);
                }, this);

                return Q.when(this.takeSnapshot('After SpecsLevelNode alterArch ' + this.getId()));
            }.bind(this));
        };
    },

    createBundleNode : function(item, level) {
        var arch = this.ctx.arch,
            opts = {
                root : this.root,
                level : this.path,
                item : item
            },
            BundleNode = this._bundleNodeClass,
            bundleNode = BundleNode.createId(opts);

        if(arch.hasNode(bundleNode)) {
            bundleNode = arch.getNode(bundleNode);
        } else {
            bundleNode = BundleNode.create(opts);
            arch.setNode(bundleNode, level, [this, PATH.join(level, '.bem/level.js')]);
        }

        var source = item.prefix + item.suffix;
        bundleNode.sources.push(source);

        if(!arch.hasNode(source)) {
            arch.setNode(
                this._fileNodeClass.create({ root : this.root, path : source }),
                bundleNode);
        }

        return bundleNode;
    },

    getBundleNodeClass : function() {
        return 'DocsSourceNode';
    }

}, {

    createName : function(o) {
        return o.item.block;
    }

});

registry.decl('DocsSourceNode', 'GeneratedFileNode', {

    __constructor : function(o) {
        this.__base(U.extend({ path : this.__self.createPath(o) }, o));
        this.rootLevel = createLevel(o.root);
        this.sources = o.sources || [];
    },

    make : function() {
        var path = this.getPath();
        return this.getSourceContent()
            .then(this.processContent.bind(this))
            .then(function(content) { return U.writeFile(path, content) });
        //.then(function() { console.log(this.ctx.arch.toString() )}.bind(this));
    },

    getSourceContent : function() {
        var content = this.sources.map(function(path) {
            return QFS
                .read(PATH.resolve(this.root, path))
                .then(function(source) { return source });
        }, this);

        return Q.all(content).then(function(content) {
            return content.join('\n');
        });
    },

    processContent : function(content) {
        return JSON.stringify({ content : MD(content) }, null, 2);
    }

}, {

    createId : function(o) {
        return this.createPath(o);
    },

    createPath : function(o) {
        return PATH.join(o.level, this.createNodePrefix(o.item) + '.doc.json');
    },

    createNodePrefix : function(o) {
        return o.block +
            (o.elem? '__' + o.elem : '') +
            (o.mod? '_' + o.mod + (o.val? '_' + o.val : '') : '');
    }

});

};
