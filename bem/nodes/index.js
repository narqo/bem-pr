exports.init = function(registry) {
    require('./monkey')(registry);
    require('./common')(registry);
    require('./examples')(registry);
    require('./tests')(registry);
    require('./sets')(registry);
};
