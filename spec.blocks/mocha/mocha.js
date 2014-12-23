(function(name, ctx, define) {
    var module = define.call(ctx, ctx);
    typeof modules === 'object'?
        modules.define(name, function(provide) { provide(module); }) :
        (ctx[name] = module);
}('mocha', this, function(global) {

// NOTE: prevent global variable `global` to appear from mocha.js
/*borschik:include:../../vendor/mocha/mocha.js*/;

return global.mocha;

}));
