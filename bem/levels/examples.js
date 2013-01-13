var BEM = require('bem');

// TODO: bem/bem-tools#naming
//exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

exports.getTechs = function() {
    
    return BEM.util.extend({ 'title.txt' : '' }, 
            require('./bundles.js').getTechs());
    
};