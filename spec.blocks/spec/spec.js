modules.require(['mocha', 'chai', 'sinon', 'sinon-chai'], function(mocha, chai, sinon, sinonChai) {
    mocha.ui('bdd');

    chai.use(sinonChai);
    chai.should();
});

(function() {
    onload(function() {
        modules.require(['mocha', 'spec'], function(mocha) {
            window.mochaPhantomJS? window.mochaPhantomJS.run() : mocha.run();
        });
    });

    function onload(fn) {
        if(window.addEventListener) {
            window.addEventListener('load', fn, false);
        } else if(window.attachEvent) {
            window.attachEvent('onload', fn);
        }
    }
})();
