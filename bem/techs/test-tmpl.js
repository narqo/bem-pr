'use strict';

var BEM = require('bem'),
    PATH = require('path');

exports.API_VER = 2;

exports.techMixin = {

    getEnvProps : function(path) {
        return JSON.parse(process.env.__tests || '{}')[PATH.dirname(path)] || {};
    },

    getTemplate : function() {
        return [
            '([',
            '"<!DOCTYPE html>",',
            '{ "tag": "html", "content": [',
            '  { "tag": "head", "content": [',
            '    { "tag": "title", "content": "" },',
            '    { "tag": "meta", "attrs": { "charset": "utf-8" } },',
            '    { "tag": "link", "attrs": { "href": "_{{bemBundleName}}.css", "rel": "stylesheet" } },',
            '    { "tag": "script", "attrs": { "src": "_{{bemBundleName}}.test.js" } }',
            '  ] },',
            '  { "tag": "body", "content":',
            '    {',
            '      "block": "test",',
            '      "decl": {{bemTmplDecl}},',
            '      "content": {{bemTmplContent}}',
            '    }',
            '  }',
            '] }',
            '])'
        ];
    },

    getTemplateData : function(env, vars, suffix) {
        return {
            BundleName : env.BundleName || vars.BlockName,
            TmplDecl : env.TmplDecl || '',
            TmplContent : env.TmplContent || ''
        };
    },

    getCreateResult : function(path, suffix, vars) {
        return BEM.template.process(
            this.getTemplate(),
            this.getTemplateData(this.getEnvProps(path), vars, suffix));
    },

    getCreateSuffixes : function() {
        return ['bemjson.js'];
    }

};
