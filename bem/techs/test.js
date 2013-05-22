exports.getBuildResultChunk = function (relPath, path, suffix) {
    return '/*borschik:include:' + relPath + '*/;\n';
};

exports.getSuffixes = function() {
    return ['test.js'];
};
