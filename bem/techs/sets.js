var PATH = require('path'),
    BEM = require('bem'),
    API = BEM.api;

exports.API_VER = 2;

exports.techMixin = {

    getBaseLevel : function() {
        return PATH.resolve(__dirname, '../levels/', this.getTechName() + '.js');
    },

    createByDecl : function(item, level, opts) {
        var params = {
                outputDir : level.dir,
                force : opts.force,
                level : this.getBaseLevel()
            },
            name = this.getPath(level.getRelByObj(item));
        return this.createLevel(params, [name]);
    },

    createLevel : function(opts, names) {
        return API.create.level(opts, { names: names });
    }

};
