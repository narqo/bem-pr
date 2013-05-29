(function() {

    listen(window, 'load', function() {

        jasmine._reporterInstance = new jasmine.HtmlReporter();

        setTimeout(
            function() {
                jasmine.getEnv().addReporter(jasmine._reporterInstance);
                jasmine.getEnv().execute();
            },
            10);

    });

    function listen(elem, evnt, callback) {
        if(elem.addEventListener) {
            elem.addEventListener(evnt, callback, false);
        }
        else if(elem.attachEvent) {
            elem.attachEvent("on" + evnt, callback);
        }
    };

})();
