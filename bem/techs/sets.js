var BEM = require('bem'),
    PATH = require('path');

exports.techMixin = {
        
    getBaseLevel : function() {
        return PATH.resolve(__dirname, '../levels/' + this.getTechName() + '.js');
    },

    createByDecl : function(item, level, opts) {
        
        return this.createLevel({
                outputDir : level.dir,
                force : opts.force,
                level : this.getBaseLevel()
            }, [this.getPath(level.getRelByObj(item))]);

    },

    createLevel : function(opts, names) {
        return BEM.api.create.level(opts, { names: names });
    }

};