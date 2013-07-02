var PATH = require('path'),
    tmpl = require('bem/lib/template');

exports.getCreateResult = function(path, suffix, vars) {

    var envProps = JSON.parse(process.env.__tests || '{}')[PATH.dirname(path)] || {};

    return tmpl.process([
        '({',
        '    block: "page",',
        '    head: [',
        '        { elem: "css", url: "_{{bemBundleName}}.css", ie: false },',
        '        { elem: "js", url: "_{{bemBundleName}}.js" },',
        '        { elem: "js", url: "_{{bemBundleName}}.test.js" }',
        '    ],',
        '    content: {',
        '        block: "test",',
        '        content: {{bemTmplContent}}',
        '    }',
        '})'
    ], {
        BundleName: envProps.BundleName || vars.BlockName,
        TmplContent: envProps.TmplContent || ''
    });
};

exports.getCreateSuffixes = function() {
    return ['bemjson.js'];
};
