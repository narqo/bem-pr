(function() {

if(typeof modules === 'object') {
    modules.define('spec', ['mocha', 'chai', 'sinon', 'sinon-chai'], function(provide) {
        define.apply(this.global, Array.prototype.slice.call(arguments, 1));
        provide();
    });
    modules.require(['jquery', 'mocha', 'spec'], function($, mocha) {
        init(this.global, $, mocha);
    });
} else {
    define(this.mocha, this.chai, this.sinon, this.sinonChai);
    init(this, this.jQuery, this.mocha);
}

function define(mocha, chai, sinon, sinonChai) {
    mocha.ui('bdd');
    chai.use(sinonChai);
    chai.should();
}

function init(global, $, mocha) {
    $(function() {
        global.mochaPhantomJS?
            global.mochaPhantomJS.run() :
            mocha.run(function() {
                // NOTE: display mocha's html-reporter only when all specs have finished (#72)
                $('#mocha').show();
            });
    });
}

}());
