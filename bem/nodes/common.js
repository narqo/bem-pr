var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    QFS = require('q-io/fs'),
    U = BEM.util,
    createLevel = BEM.createLevel;

module.exports = function(registry) {

var FileNode = registry.getNodeClass('FileNode');

registry.decl('GeneratedLevelNode', 'MagicNode', {

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

        this.__base(U.extend({ path : this.__self.createPath(o) }, o));

        this.rootLevel = createLevel(o.root);
        this.outputDir = this._level;
        this.outputName = this.__self.createName(this);
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx;

        return function() {
            var arch = ctx.arch,
                path = this.path;

            if(arch.hasNode(path)) {
                return arch.getNode(path).getId();
            }

            var levelNode = new FileNode({
                root : this.root,
                path : path
            });

            arch.setNode(levelNode, arch.getParents(this));

            var CreateLevelNode = registry.getNodeClass('BemCreateLevelNode'),
                opts = {
                    root : this.root,
                    output : this.outputDir,
                    name : this.outputName,
                    proto : this.getProtoLevelPath()
                },
                realLevelNode = this.useFileOrBuild(new CreateLevelNode(opts));

            arch.setNode(realLevelNode, levelNode);

            return levelNode.getId();
        };
    },

    useFileOrBuild : function(node) {
        if(FS.existsSync(node.getLevelPath())) {
            return new FileNode({
                root : this.root,
                path : node.levelPath
            });
        }

        return node;
    },

    getProtoLevelName : function() {
        return 'bundles';
    },

    getProtoLevelPath : function() {
        return PATH.join(U.findLevel(this.getPath(), 'project'), '.bem/levels', this.getProtoLevelName());
    }

}, {

    createId : function(o) {
        return this.__base({ path : this.createPath(o) });
    },

    createPath : function(o) {
        return this.createNodePrefix(U.extend({}, o));
    },

    createName : function(o) {
        var item = o.item,
            name = item.block,
            pt;

        if(pt = item.elem) {
            name += '__' + pt;
        }

        if(pt = item.mod) {
            name += '_' + pt;
            if(pt = item.val) {
                name += '_' + pt;
            }
        }

        return name;
    },

    createNodePrefix : function(o) {
        return PATH.join(o.level, this.createName(o));
    }

});


registry.decl('TargetFileNode', 'GeneratedFileNode', {

    make : function() {
        var path = this.getPath();
        return QFS.exists(path).then(function(exists) {
            if(!exists) return QFS.makeTree(path);
        });
    }

}, {

    createId : function(o) {
        return this.__base(o) + '~';
    }

});


registry.decl('TargetsLevelNode', 'GeneratedLevelNode', {

    __constructor : function(o) {
        this.sources = o.sources || [];
        this.techName = o.techName;
        this.__base(o);
    },

    getBundleNodeClass : function() {
        return registry.getNodeClass('TargetBundleNode');
    },

    getSourceItemTechs : function() {
        return [];
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

    getTechSuffixesForLevel : function(level) {
        return this.getSourceItemTechs()
            .reduce(function(techs, tech) {
                return techs.concat(level.getTech(tech).getSuffixes());
            }, [])
            .map(function(suffix) {
                return '.' + suffix;
            });
    },

    scanSourceLevel : function(level) {
        var relativize = PATH.relative.bind(null, this.root),
            suffixes = this.getTechSuffixesForLevel(level);

        // TODO: Level#scanFiles()
        return level.getItemsByIntrospection()
            .filter(function(item) {
                return ~suffixes.indexOf(item.suffix);
            })
            .map(function(item) {
                item.level = relativize(level.dir);
                // XXX: key?
                //item.key = serializeBemItem(item.level, item);
                return item;
            });
    },

    scanSources : function() {
        return this.getSources()
            .map(this.scanSourceLevel.bind(this))
            .reduce(function(decls, item) {
                return decls.concat(item);
            }, []);
    }

});

registry.decl('TargetBundleNode', 'BundleNode', {

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
    }

});

};
