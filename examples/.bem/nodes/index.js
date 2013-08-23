module.exports = function(registry) {
    require('./arch')(registry);
    require('./bundles')(registry);
    require('./examples')(registry);
    require('./tests')(registry);
};
