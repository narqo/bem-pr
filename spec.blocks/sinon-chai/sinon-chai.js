(function(ctx, deps, define) {
    var module = define.call(ctx);
    typeof modules === 'object'?
        modules.define('sinon-chai', deps, function(provide) { provide(module); }) :
        (ctx.sinonChai = module);
}(this, ['chai'], function() {

var sinonChai;

(function(chai) {
/* borschik:include:../../node_modules/sinon-chai/lib/sinon-chai.js */
}.call(this, { use : function(module) { sinonChai = module; }}));

return sinonChai;

}));
