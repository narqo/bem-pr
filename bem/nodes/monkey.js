/**
 * @fileOverview Набор monkey-patched целей bem-make, решающих встречающиеся
 * проблемы, для которых (еще) нет решения в bem-tools.
 */

var BEM = require('bem'),
    PATH = require('path'),
    createLevel = BEM.createLevel;

module.exports = function(registry) {

registry.decl('BlockNode', {

    /**
     * @see https://github.com/bem/bem-tools/pull/341
     */
    __constructor : function(o) {

        this.__base(o);

        this.level = undefined;
        this._level = typeof o.level === 'string'? o.level : o.level.dir;

        var level;
        Object.defineProperty(this, 'level', {
            get : function() {
                return createLevel(PATH.resolve(this.root, this._level));
            }
        });

    }

});

};
