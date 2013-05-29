var tmpl = require('bem/lib/template');

exports.getCreateResult = function(path, suffix, vars) {

    var tmplVars = JSON.parse(process.env.testTmplVars || '{}');

    return tmpl.process([
        '({',
        '    block: "b-page",',
        '    head: [',
        '        { elem: "css", url: "_{{bemBundleName}}.css", ie: false },',
        '        { elem: "js", url: "http://yandex.st/jquery/1.7.2/jquery.min.js" },',
        '        { elem: "js", url: "_{{bemBundleName}}.js" },',
        '        { elem: "js", url: "_{{bemBundleName}}.{{bemTestsTechName}}" }',
        '    ],',
        '    content: {',
        '        block: "i-bem",',
        '        elem: "test",',
        '        content: [',
        '            {{bemContent}}',
        '        ]',
        '    }',
        '})'
    ], tmplVars);
};

exports.getCreateSuffixes = function() {
    return ['bemjson.js'];
};
