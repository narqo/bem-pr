(function(ctx, define) {
    var module = define.call(ctx);
    typeof modules === 'object'?
        modules.define('sinon', function(provide) { provide(module); }) :
        (ctx.sinon = module);
}(this, function() {

/* borschik:include:../../vendor/sinon/index.js */
return this.sinon;

}));
