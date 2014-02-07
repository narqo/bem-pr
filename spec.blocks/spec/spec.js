modules.define(
    'spec',
    ['mocha', 'chai', 'sinon', 'sinon-chai'],
    function(provide, mocha, chai, sinon, sinonChai) {

mocha.ui('bdd');

chai.use(sinonChai);
chai.should();

provide();

});

modules.require(['jquery', 'mocha', 'spec'], function($, mocha) {
    $(function() {
        window.mochaPhantomJS?
            window.mochaPhantomJS.run() :
            mocha.run(function() {
                // NOTE: display reporter only when all tests finished (#72)
                $('#mocha').show();
            });
    });
});
