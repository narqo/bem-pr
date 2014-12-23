(function(ctx, define) {
    var module = define.call(ctx, ctx);
    typeof modules === 'object'?
        modules.define('simulate-dom-event', function(provide) { provide(module); }) :
        (ctx.simulateEvent = module);
}(this, function(global) {

var module = { exports : {} };

/* borschik:include:../../vendor/simulate-dom-event/index.js */

return function simulateDomEvent(domElem, type, opts) {
    var target = 'jquery' in Object(domElem)? domElem[0] : domElem;
    module.exports(target, type, opts);
};

}));
