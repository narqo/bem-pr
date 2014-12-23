module.exports = function(bh) {

bh.match('spec-runner', function(ctx, json) {
    ctx
        .tag('script')
        .content([
            '(function() {',
            'var global = this;',
            'typeof modules === "object"?',
            '  modules.require(["jquery", "mocha", "spec"], function($, mocha) {',
            '    init($, mocha);',
            '  }) : ',
            '  init(global.jQuery, global.mocha);',
            'function init($, mocha) {',
            '  global.mochaPhantomJS? global.mochaPhantomJS.run(done) : mocha.run(done);',
            '  function done() { $("#mocha").show() }',
            '}',
            '}());'
        ], true);
});

};
