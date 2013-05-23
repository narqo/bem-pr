BEM.TEST = {

    /**
     * Declares a test.
     *
     * @param {String|Object} desc Block name (simple syntax) or description
     * @param {Function} test Test description in jasmine format
     */
    decl: function(desc, test) {

        desc = this._getIdByDesc(desc);

        this._decls[desc] = (this._decls[desc] || []).concat(test);
    },

    _decls: {},

    /**
     * Adds tests to the "test runner".
     *
     * @param {Array} blocks
     */
    _run: function(blocks) {

        blocks = blocks ? $.makeArray(blocks) : Object.keys(this._decls);

        blocks.forEach(function(desc, i) {

            desc = this._getIdByDesc(desc);

            if(!this._decls[desc]) {
                throw new Error('Undefined test ' + desc);
            }

            this._decls[desc].forEach(function(test) { describe(desc, test) });
        }, this)
    },

    _getIdByDesc: function(desc) {

        var rslt = '';

        if(typeof desc === 'string') {
            rslt = desc;
        }
        else {
            rslt += desc.block;
            rslt += desc.elem ? '__' + desc.elem : '';
            rslt += desc.modName ? '_' + desc.modName + '_' + desc.modVal : '';
        }

        return rslt;
    }
};

BEM.DOM.decl('i-bem__test', {

    onSetMod : {

        'js' : function() {

            BEM.TEST._run(this.params.tests);

        }
    }
});
