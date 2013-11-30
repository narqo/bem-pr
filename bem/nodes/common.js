var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    QFS = require('q-io/fs');

module.exports = function(registry) {

var U = BEM.util,
    createLevel = BEM.createLevel,
    FileNode = registry.getNodeClass('FileNode');

function serializeBemItem() {
    return Array.prototype.slice.call(arguments, 0)
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

    create : function(o) {
        return new this(o);
    },

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
        this.__base(o);
    },

    addSources : function(sources) {
        this._sources = null;
        this.sources = this.sources.concat(sources);
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

};
