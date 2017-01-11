(function(ctx, define) {
    var module = define.call(ctx);
    typeof modules === 'object'?
        modules.define('sinon', function(provide) { provide(module); }) :
        (ctx.sinon = module);
}(this, function() {

/* borschik:include:../../node_modules/sinon/pkg/sinon.js */
return this.sinon;

}));
