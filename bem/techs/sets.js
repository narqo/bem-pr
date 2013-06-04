var PATH = require('path'),
    BEM = require('bem');

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
        return BEM.api.create.level(opts, { names: names });
    }

};
