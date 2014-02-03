module.exports = function rollRegistry(registry) {
    [
        'monkey',
        'level',
        'common',
        'target',
        'sets',
        'examples',
        'tests',
        'specs',
        'docs',
        'jsdoc',
        //'metadoc'
    ]
    .forEach(function(mod) {
        require('./' + mod)(registry);
    });
};
