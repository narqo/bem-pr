var PATH = require('path'),
    tmpl = require('bem/lib/template');

exports.API_VER = 2;

exports.techMixin = {

    getCreateResult : function(path, suffix, vars) {
        var envProps = JSON.parse(process.env.__tests || '{}')[PATH.dirname(path)] || {};

        return tmpl.process([
            '({ tag: \'html\', content: [',
            '  { tag: \'head\', content: [',
            '    { tag: \'link\', attrs: { href: \'_{{bemBundleName}}.css\' } },',
            '    { tag: \'script\', attrs: { src: \'_{{bemBundleName}}.test.js\' } }',
            '  ] },',
            '  { tag: \'body\', content:',
            '    { block: \'test\', decl:',
            '      {{bemTmplContent}}',
            '    }',
            '  }',
            ']})'
        ], {
            BundleName: envProps.BundleName || vars.BlockName,
            TmplContent: envProps.TmplContent || ''
        });
    },

    getCreateSuffixes : function() {
        return ['bemjson.js'];
    }

};
