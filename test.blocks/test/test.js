(function(w) {

    if(w.addEventListener) {
        w.addEventListener('load', runTests, false);
    }
    else if(w.attachEvent) {
        w.attachEvent('onload', runTests);
    }

    function runTests() {
        modules.require(['mocha', 'chai', 'sinon'], function(mocha, chai, sinon) {

            mocha.ui('bdd');
            chai.should();

            modules.require(['test'], function() {
                w.mochaPhantomJS ? mochaPhantomJS.run() : mocha.run();
            });
        });
    }
})(window);
