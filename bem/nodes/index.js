module.exports = function rollRegistry(registry) {
    [
        'monkey',
        'level',
        'phantomjs',
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
