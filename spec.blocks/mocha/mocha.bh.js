module.exports = function(bh) {

    bh.match('mocha', function(ctx) {
        ctx.attrs('id', 'mocha');
    });

};
