var PATH = require('path'),
    Deps = require('bem/lib/techs/v2/deps.js').Deps,
    BEM = require('bem'),
    Q = BEM.require('q');


exports.API_VER = 2;

exports.techMixin = {

    getBuildSuffixesMap:function(){
        return { 'test.js' : ['test.js', 'browser.js', 'js'] };
    },

    getWeakBuildSuffixesMap: function() {
        return {
            'test.js': ['test.js', 'vanilla.js', 'js', 'browser.js', 'bemhtml']
        };
    },

    transformBuildDecl: function(decl) {
        var buildSuffixes = this.getWeakBuildSuffixesMap();
        var sourceSuffixes = this.getWeakSuffixesMap();

        return decl
            .then(function(decl){
                var deps = new Deps().parseDepsDecl(decl)
                    .filter(function(dependsOn, dependent) {
                        return (((dependsOn.item.tech in sourceSuffixes) && dependent.item.tech in buildSuffixes) ||
                           (!dependsOn.item.tech && !dependent.item.tech));
                    }).map(function(item){
                        return item.item;
                    });
                return {deps: deps};
            });
    },

    getBuildResult: function(files, suffix, output, opts) {
        var bemhtmlTech = this.context.createTech('bemhtml'),
            browserTech = this.context.createTech('browser.js'),
            testJSTech = this.context.createTech('test.js'),
            decl = this.transformBuildDecl(this.context.opts.declaration);

        if(!(browserTech.API_VER === 2 && bemhtmlTech.API_VER === 2 && testJSTech.API_VER === 2)){
            return Q.reject(this.getTechName() + ' can\'t use v1 techs to produce pieces of result');
        }

        opts = Object.create(opts);
        opts.force = true;

        return Q.all(
            [
                bemhtmlTech.getBuildResults(
                    bemhtmlTech.transformBuildDecl(decl),
                    this.context.getLevels(),output,opts),
                browserTech.getBuildResults(
                    browserTech.transformBuildDecl(decl),
                    this.context.getLevels(),output,opts),
                testJSTech.getBuildResults(
                    testJSTech.transformBuildDecl(decl),
                    this.context.getLevels(),output,opts)])
            .spread(function(bemhtml, browser, test){
                var result = browser.js;
                result.push(test['test.js'] + '\n');
                result.push(bemhtml['bemhtml.js']+'\n');
                return result;
            });
    }

};
