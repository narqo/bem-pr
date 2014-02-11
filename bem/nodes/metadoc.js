var PATH = require('path'),
    BEM = require('bem'),
    Q = require('q'),
    QFS = require('q-io/fs'),
    U = BEM.util,
    createLevel = BEM.createLevel;

module.exports = function(registry) {

registry.decl('MetadocLevelNode', 'TargetLevelNode', {

    __constructor : function(o) {
        this.__base(o);
        this._bundleNodeClass = registry.getNodeClass(this.getBundleNodeClass());
        this._fileNodeClass = registry.getNodeClass('FileNode');
    },

//    make : function() {
//        return this.__base.apply(this, arguments)
//            .then(function() { console.log(this.ctx.arch.toString()) }.bind(this));
//    },

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
        return 'MetadocSourceNode';
    }

}, {

    createName : function(o) {
        return o.item.block;
    }

});

registry.decl('MetadocSourceNode', 'GeneratedFileNode', {

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
        return content;
    }

}, {

    createId : function(o) {
        return this.createPath(o);
    },

    createPath : function(o) {
        return PATH.join(o.level, this.createNodePrefix(o.item) + '.metadoc.json');
    },

    createNodePrefix : function(o) {
        return o.block +
            (o.elem? '__' + o.elem : '') +
            (o.mod? '_' + o.mod + (o.val? '_' + o.val : '') : '');
    }

});

/*
registry.decl('MetadocSourceNode', 'DocsSourceNode', {

    make : function() {
        var data = {},
            content = this.sources.map(function(item) {
                var content,
                    itemLevel = createLevel(item.level);

                if(item.tech !== 'examples') {
    //                // for entities in desc.md, desc.wiki, title.txt techs
    //                // we read their files and parse them. title.txt content is returned as is.
    //                var path = itemLevel.getPathByObj(item, item.suffix.substring(1));
    //
    //                content = U.readFile(path)
    //                    .then(function(c) {
    //                        if (item.tech === 'desc.md') return MD(c);
    //                        if (item.tech === 'desc.wiki') return SHMAKOWIKI.shmakowikiToBemjson(c);
    //
    //                        return c;
    //                    });
                } else {
                    content = this.readExamples(item);
                }

                var obj = this.constructJson(data, item);
                return Q.when(content, function(content) {
                    var key = 'description';
                    if(item.tech === 'title.txt') key = 'title';
                    else if(item.tech === 'examples') key = 'examples';

                    obj[key] = obj[key] || [];
                    obj[key].push({
                        level : item.level,
                        content : content
                    });
                });
            }, this);

        Q.all(content).then(function() {
            console.log(JSON.stringify(data, null, 2));
        });
    },

    readExamples : function(item) {
        var exampleLevel = createLevel(PATH.join(this.root, item.prefix + item.suffix));

        return Q.all(exampleLevel.getItemsByIntrospection()
            .filter(function(item) {
                return item.suffix === '.bemjson.js';
            })
            .map(function(exampleitem) {
                //var examplePath = exampleLevel.getPathByObj(exampleitem, exampleitem.suffix.substring(1));
                //console.log(examplePath);
//                return U.readFile(examplePath)
//                    .then(function(exampleDesc) {
//                var url = ExampleNode.createNodePrefix(U.extend({}, item));
//                        var url =
//                            _this.rootLevel.getRelPathByObj({ block : item.block, tech : 'examples' }, 'examples');
//                console.log(url);

                        // content var will contain array of {url, title) objects with
                        // example link and description
                return {
                    title : exampleitem.block
                };
//                    });
            })
        );
    },

    constructJson : function(json, item) {
        var getObj = function() {
            return {
                // JSON.stringify() will serialize object properties into array
                toJSON : function() {
                    var _this = this;
                    return Object.keys(this).sort()
                        .filter(function(key) {
                            return typeof _this[key] !== 'function';
                        })
                        .map(function(key) {
                            return _this[key];
                        });
                }
            };
        };

        json.name = item.block;
        var obj = json;
        if(item.elem) {
            obj = obj.elems || (obj.elems = getObj());
            obj = obj[item.elem] || (obj[item.elem] = { name : item.elem });
        }

        if(item.mod) {
            obj = obj.mods || (obj.mods = getObj());
            obj = obj[item.mod] || (obj[item.mod] = { name : item.mod });
        }

        if(item.val) {
            obj = obj.vals || (obj.vals = getObj());
            obj = obj[item.val] || (obj[item.val] = { name : item.val });
        }

        return obj;
    }

});
*/

};

