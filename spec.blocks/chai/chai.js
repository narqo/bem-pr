(function(ctx, define) {
    var module = define.call(ctx);
    typeof modules === 'object'?
        modules.define('chai', function(provide) { provide(module); }) :
        (ctx.chai = module);
}(this, function() {

/* borschik:include:../../vendor/chai/chai.js */
return this.chai;

}));
