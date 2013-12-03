var PATH = require('path'),
    BEM = require('bem');

exports.API_VER = 2;

exports.techMixin = {

    getTemplate : function() {
        return [
            '([',
            '"<!DOCTYPE html>",',
            '{"tag": "html", "content": [',
            '  {"tag": "head", "content": [',
            '    {"tag": "title", "content": "{{bemBundleName}}"},',
            '    {"tag": "meta", "attrs": {"charset": "utf-8"}},',
            '    {"tag": "link", "attrs": {"href": "_{{bemBundleName}}.css", "rel": "stylesheet"}},',
            '    {"tag": "script", "attrs": {"src": "_{{bemBundleName}}.spec.js"}}',
            '  ]},',
            '  {"tag": "body", "content":',
            '    {',
            '      "block": "spec",',
            '      "decl": {{bemTmplDecl}},',
            '      "content": {{bemTmplContent}}',
            '    }',
            '  }',
            ']}',
            '])'
        ];
    },

    getCreateResult : function(path, suffix, vars) {
        var envProps = JSON.parse(process.env.__tests || '{}')[PATH.dirname(path)] || {};
        return BEM.template.process(
            this.getTemplate(),
            {
                BundleName : envProps.BundleName || vars.BlockName,
                TmplDecl : envProps.TmplDecl || "",
                TmplContent : envProps.TmplContent || ""
            });
    },

    getCreateSuffixes : function() {
        return ['bemjson.js'];
    }

};
