describe('"block1" may have some test', function() {
    it('Friday the 15th of May, was monday', function() {
        (new Date(2013, 4, 15)).getDay().should.be.equal(3);
    });
});
