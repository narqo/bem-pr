$(window).load(function() {

    jasmine._reporterInstance = new jasmine.HtmlReporter();

    setTimeout(
        function() {
            jasmine.getEnv().addReporter(jasmine._reporterInstance);
            jasmine.getEnv().execute();
        },
        10);

});
