/* jshint curly:false */

var FS = require('fs'),
    PATH = require('path'),
    BEM = require('bem'),
    Q = require('bem/node_modules/q'),
    QFS = require('bem/node_modules/q-fs'),
    U = BEM.util,
    createLevel = BEM.createLevel;

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

module.exports = function(registry) {

registry.decl('CreateLevelNode', 'BemCreateNode', {

    __constructor : function(o) {
        this.__base(o);
        this.levelPath = this.__self.createLevelPath(o);
    },

    getLevelPath : function() {
        return PATH.resolve(this.root, this.levelPath);
    },

    lastModified : function() {
        var base = this.__base.bind(this, arguments);
        return QFS.lastModified(this.getLevelPath())
            .fail(base);
    },

    make : function() {
        var _t = this,
            base = this.__base.bind(this, arguments);

        return QFS.exists(this.getLevelPath())
            .then(function(exists) {
                if(exists && !_t.ctx.force) return;

                return base()
                    .then(function() {
                        // NOTE: drops level path cache (for bem tech/v2)
                        createLevel(_t.getPath(), { noCache : true });
                    });
            });
    }

}, {

    createId : function(o) {
        return this.createLevelPath(o);
    },

    createLevelPath : function() {
        var path = this.createPath.apply(this, arguments);
        return PATH.join(path, '.bem', 'level.js');
    }

});


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
        this.techName = o.item.tech;
        this.sources = o.sources || [];

        this.__base(U.extend({ path : this.__self.createPath(o) }, o));

        this.rootLevel = createLevel(this.root);
    },

    make : function() {
        return this.ctx.arch.withLock(this.alterArch(), this);
    },

    alterArch : function() {
        var ctx = this.ctx;

        return function() {
            var arch = ctx.arch,
                snapshot1 = this.takeSnapshot('Before GeneratedLevelNode alterArch'),
                CreateLevelNode = registry.getNodeClass('CreateLevelNode'),
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
                levelNode = registry.getNodeClass('FileNode').create({
                    root : this.root,
                    path : path
                });

                var realLevelNode = this.useFileOrBuild(new CreateLevelNode(opts));

                arch.setNode(levelNode, arch.getParents(this))
                    .setNode(realLevelNode, levelNode);
            }

            return Q.all([snapshot1, this.takeSnapshot('After GeneratedLevelNode alterArch ' + this.getId())])
                .then(function() {
                    return levelNode.getId();
                });
        };
    },

    useFileOrBuild : function(node) {
        if(FS.existsSync(node.getLevelPath())) {
            return new registry.getNodeClass('FileNode').create({
                root : this.root,
                path : node.levelPath
            });
        }

        return node;
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
                if(typeof level === 'string') {
                    return createLevel(absolutivize(level));
                }
                return level;
            });
        }

        return this._sources;
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
    },

    scanSources : function() {
        return this.getSources()
            .map(this.scanSourceLevel.bind(this))
            .reduce(function(decls, item) {
                return decls.concat(item);
            }, []);
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

};
