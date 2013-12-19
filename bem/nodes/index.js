module.exports = function rollRegistry(registry) {
    [
        'monkey',
        'level',
        'common',
        'examples',
        'tests',
        'specs',
        'sets'
    ]
    .forEach(function(mod) {
        require('./' + mod)(registry);
    });
};
