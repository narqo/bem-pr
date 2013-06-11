modules.require(['mocha', 'chai', 'sinon'], function() {

    mocha.ui('bdd');
    chai.should();

    modules.require(['test'], function() {
        window.mochaPhantomJS ? mochaPhantomJS.run() : mocha.run();
    });
});
