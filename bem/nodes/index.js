var PATH = require('path');

function rollRegistry(registry) {
    [
        'monkey',
        'level',
        'common',
        'examples',
        'specs',
        'sets'
    ].map(function(mod) {
        return PATH.join(__dirname, mod);
    })
    .forEach(function(mod) {
        require(mod)(registry);
    });
}

module.exports = rollRegistry;
