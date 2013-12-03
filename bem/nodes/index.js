var PATH = require('path');

function rollRegistry(registry) {
    [
        'monkey',
        'level',
        'common',
        'examples',
        'tests',
        'sets'
    ].map(function(mod) {
        return PATH.join(__dirname, mod);
    })
    .forEach(function(mod) {
        require(mod)(registry);
    });
}

module.exports = rollRegistry;
