module.exports = function(bh) {

bh.match('spec', function(ctx) {
    ctx.tag(null);
    ctx.content([
        {
            block: 'mocha'
        },
        {
            block: 'spec-content'
        }
    ]);
});

};
