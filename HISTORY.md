0.5.2 / 2013-12-09
==================

  * fix #64

0.5.1 / 2013-12-06
==================

  * fix #63

0.5.0 / 2013-12-03
==================

NOTE: this release breaks backward compability with previous versions

  * no more `<setName>.sets` levels needed, all building process are made
    in `<setName>.<tech>` direcotories, e.g. `desktop.examples` (#36)
  * teches are declared with `SetsNode#getSoutceTechs`
  * no more default teches declared — user should always use `getSoutceTechs`
    in `make.js` to specify sets' teches
  * all tests related stuff renamed to `specs` (#62)

    - tests -> specs
    - test.js -> spec.js
    - test-tmpl -> spec.bemjson.js
    - TestNode -> SpecNode

  * SpecNode in no longer inherits from ExampleNode, so
    `SpecNode#getTechs` and `SpecNode#getLevels` should be defined explicitly
  * default test's bundle is <spec-tech-name> instead of `default`,
    for example `desktop.specs/dom/spec-js`
  * bug fixed


0.3.6 / 2013-10-29
==================

  * fix race when running tests from bem-server (@SevInf) #57

0.3.5 / 2013-08-23
==================

NOTE: all tech modules rewriten to v2 API of bem >= 0.6.15

  * fix #46
  * fix #48
  * fix #49
  * drop dependency from bem-core's "page" block in test-tmpls tech

0.3.1 / 2013-08-17
==================

  * bug fixed

0.3.0 / 2013-07-31
==================

NOTE: this release requires bem >= 0.6.x

  * tech modules were refactored to satisfy v2 API (#40)

0.2.3 / 2013-07-27
==================

  * fix #38

0.2.2 / 2013-07-21
==================

  * hot fix

0.2.1 / 2013-07-21
==================

  * build nodes were spreaded into separate modules to simplify future
    maintenance

0.2.0 / 2013-07-18
==================

  * fix #1
  * fix #15
  * fix #26
  * fix #30

0.1.0 / 2013-07-08
==================

  * bugs fixed
  * demo sub-project added

0.0.10 / 2013-06-18
==================

  * Switch to the framework Mocha using the assert library Chai
  * Switch to the module system [ym](https://github.com/ymaps/modules)
  * Renaming the technology phantom.js -> phantomjs
  * The possibility to redefine the console reporter (parameter `consoleReporter`)
  * Added plugin sinon-chai
  * Added the goal to run all tests: all.tests

0.0.9 / 2013-06-05
==================

  * tests assembly added (@mishaberezin) #8
  * documentation for tests assembly added in russian
  * mkdirp npm-dependency removed

0.0.5 / 2013-04-05
==================

  * move to bem>=0.5.30

0.0.4 / 2013-03-12
==================

  * base BEM-configs refactoring

0.0.3 / 2013-01-26
==================

  * adding parent node for "sets" node should be option
  * howto guide improved

0.0.2 / 2013-01-16
==================

  * sets node for bem-make fixed to build all the sets
  * fixed build nodes order
  * fixed issue with first-run levels resolving, when bem-make couldn't resolve tech's path properly (see bem/bem-tools/issues#341)
  * howto guide added in russian

0.0.1 / 2013-01-13
==================

  * root sets node added to build all sets
  * some code refactoring
  * documentation fixed

0.0.0 / 2013-01-10
==================

  * first working draft released
  * basic documentation in russian

