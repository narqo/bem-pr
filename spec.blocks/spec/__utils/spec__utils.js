/**
 * @module spec__utils
 */
modules.define('spec__utils', ['i-bem__dom', 'BEMHTML', 'jquery'], function(provide, BEMDOM, BEMHTML, $) {

provide({
    /**
     * Builds a block by name and bemjson
     *
     * @function buildBlock
     * @param {string} name
     * @param {object} bemjson
     * @return {object} bem block
     */
    buildBlock : function(name, bemjson) {
        bemjson = bemjson || { block : name };
        return BEMDOM.init($(BEMHTML.apply(bemjson)).appendTo('body')).bem(name);
    },

    /**
     * Clean up block
     *
     * @function destruct
     * @param {object} block bem block
     */
    destruct : function(block) {
        BEMDOM.destruct(block.domElem);
    }
});

});
