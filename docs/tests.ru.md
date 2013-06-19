Сборка тестов
=============

- [Абстрактные знания](#--1)
- [Варианты оформления тестов](#--)
	- [Тесты, не требующие специфичного DOM-дерева](#----dom-)
	- [Тесты, требующие специфичное DOM-дерево](#---dom-)
- [Оформление файла `block.test.js`](#--blocktestjs)
- [Оформление файла `block.tests/testbundle.bemjson.js`](#--blockteststestbundlebemjsonjs)
- [Оформление элемента `i-bem__test`](#--i-bem__test)
- [Проектные настройки](#--2)
	- [Расширяем класс TestNode](#--testnode)
	- [Настраиваем сборку `_testbundle.test.js` и `_testbundle.js`](#--_testbundletestjs--_testbundlejs)
	- [Добавляем в проект модуль технологии `tests.js`](#-----testsjs)
	- [Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`](#----testsjs----sets)
	- [Указываем пути до технологий в `.bem/levels/bundles.js`](#-----bemlevelsbundlesjs)
- [Сборка и запуск тетов](#---)
- [Демонстрация](#-1)

### Абстрактные знания

Тест состоит из двух сущностей: тестовый бандл (раннер) и набор тестов.

Тестовые бандлы оформляются по полной аналогии с примерами, в папке `block.tests`.

У каждого тестового бандла может быть свой дополнительный уровень переопределения.

Наборы тестов пишутся в технологии `test.js`.

Набор тестов можно сделать для любой bem-сущности (блок, элемент и т.д.).

Для тестирования используется фреймворк [mocha](http://visionmedia.github.io/mocha/) в режиме `bdd`.

Для ассертов используется библиотека [chai](http://chaijs.com/) с плагином [sinon-chai](https://github.com/domenic/sinon-chai).
На момент запуска тестов метод `chai.should` уже выполнен (http://chaijs.com/guide/styles/).

Для моков используется библиотека [sinon](http://sinonjs.org/).

### Варианты оформления тестов

Условно можно выделить два случая:

1. Тесты, не требующие специфичного DOM-дерева, либо создающие его самостоятельно через js.
2. Тесты, требующие специфичное DOM-дерево, созданное на этапе генерации страницы.


#### Тесты, не требующие специфичного DOM-дерева

Для первого случая подходит простая схема оформления тестов:

    common.blocks/block/
    ├── __elem
    │   └── ...
    ├── block.css
    ├── block.deps.js
    ├── block.test.js
    └── block.js

Тесты пишутся в файле `block.test.js`.
В данном случае это тесты для блока, но можно точно также написать их для элемента или модификатора.
Этого достаточно, чтобы собрать дефолтный тестовый бандл, в рамках которого будут запущены тесты из этого файла.


#### Тесты, требующие специфичное DOM-дерево

Во втором случае нам требуется входное bem-дерево. Для этого по аналогии с примерами в папке блока создается директория `block.tests`:

    common.blocks/block/
    ├── __elem
    │   ├── block__elem.css
    │   └── block__elem.title.txt
    ├── block.tests
    │   ├── testbundle.bemjson.js
    ├── block.test.js
    └── block.js

Здесь мы гораздо лучше контролируем процесс. В `testbundle.bemjson.js` можно задать bem-дерево для полноценной страницы, указать тесты каких конкретно блоков запускать.

Для этого конкретного бандла можно задать свой дополнительный уровень переопределения:

    common.blocks/block/
    ├── __elem
    │   ├── block__elem.css
    │   └── block__elem.title.txt
    ├── block.tests
    │   ├── testbundle.bemjson.js
    │   └── testbundle.blocks
    │       └── myblock
    │           └── myblock.test.js
    ├── block.test.js
    └── block.js

**Важно**  
Файл `testbundle.bemjson.js` должен интерпретироваться как блок в технологии `bemjson.js`, 
поэтому в имени тестового бандла нельзя использовать нижнее подчеркивание.

### Оформление файла `block.test.js`

Тесты пишутся под фреймворк mocha с использованием библиотеки ассертов chai.

Для запуска тестов используется [модульная система](https://github.com/ymaps/modules).
Каждый тест декларируется под именем `test` и провайдит `undefined`.

Пример:

```js
modules.define('test', function(provide) {

    describe('block', function() {
        it('Два умножить на два должно равняться четырем', function() {
            (2*2).should.to.equal(4);
        });
    });

    provide();
});
```


### Оформление файла `block.tests/testbundle.bemjson.js`

В `testbundle.bemjson.js` пишется произвольный bemjson плюс:
- Подключение `testbundle.test.js` (должно идти после подключения обычного js);
- Нужно задекларировать блок `test`.

Пример:

```js
({
    block: 'b-page',
    head: [
        { elem: 'js', url: 'http://yandex.st/jquery/1.7.2/jquery.min.js' },
        { elem: 'css', url: '_testbundle.css', ie: false },
        { elem: 'js', url: '_testbundle.js' },
        { elem: 'js', url: '_testbundle.test.js' }
    ],
    content: [
        { block: 'test' },
        { block: 'header' },
        { block: 'content' },
        { block: 'footer' }
    ]
})
```

### Оформление блока `test`

`test` это специальный блок, который поставляется с библиотекой `bem-pr`. Он умеет запускать тесты.
Делает две простые вещи:
- Дает возможность прогнать тесты конкретных блоков;
- Подтягивает за собой тестовый фреймворк (mocha), библиотеку ассертов (chai) и пр.

Есть два способа оформления блока `test` в `testbundle.bemjson.js`.
Запустить все тесты, какие приехали по зависимостям:

```js
{ block: 'test' }
```

Запустить тесты конкретных блоков:

```js
{
    block: 'test',
    content: [
        { block: 'block' },
        { block: 'block', elem: 'elem' },
        { block: 'another-block'},
        ...
    ]
}
```

### Проектные настройки

В файле `.bem/make.js`:
- Расширяем класс `TestNode`
- Настраиваем сборку `_testbundle.test.js`

В директории `.bem/techs`:
- Добавляем в проект модуль технологии `tests.js`

В файле `*.sets/.bem/level.js`:
- Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`

В файле `.bem/levels/bundles.js`:
- Указываем пути до технологий `test.js`, `test-tmpl`, `phantomjs`, `browser.js` и `vanilla.js`.


#### Расширяем класс TestNode

Сначала нужно настроить сборку примеров (и убедиться, что она работает): https://github.com/narqo/bem-pr/blob/master/docs/howto.ru.md

За сборку тестовых бандлов отвечает класс `TestNode` (он расширяет класс `ExampleNode`).

Расширяем этот класс:
- Добавляем уровень переопределения `bem-pr/test.blocks` (там лежит блок `test`);
- Указываем технологии, в которых будет собираться тестовый бандл;
- Указываем web-адрес, который смотрит на корень проекта (опционально);
- Указываем название репортера, который будет выводить результаты тестов в консоли (опционально).

```js
MAKE.decl('TestNode', {

    getLevels : function() {
        return this.__base().concat([
            'bem-pr/test.blocks'
        ]);
    },

    getTechs : function() {

        return [
            'bemjson.js',
            'bemdecl.js',
            'deps.js',
            'bemhtml',
            'browser.js',
            'css',
            'html',
            'test.js',
            'phantomjs',
        ];
    },

    webRoot: 'http://islands-page.dev/',

    consoleReporter: 'teamcity'
})
```

Выше я предполагаю, что полный набор уровней уже указан для класса `ExampleNode`, поэтому просто расширяю этот набор уровнем `bem-pr/test.blocks`.

`webRoot` должен быть таким, чтобы от него можно было отложить путь до тестового бандла: `http://islands-page.dev/smth.sets/block.tests/test-bundle/test-bundle.html`.

`webRoot` указывается со слешом на конце.

Возможные значения поля `consoleReporter` смотри в [документации к mocha-phantomjs](https://github.com/metaskills/mocha-phantomjs#supported-reporters). По умолчанию используется репортер `spec`.


#### Настраиваем сборку `_testbundle.test.js` и `_testbundle.js`

Технологии `test.js` и `browser.js` продуцируют js-файлы, содержащие борщиковые инклуды.
Нужно расширить класс `BundleNode`, чтобы получить соответствующие `_testbundle.test.js` и `_testbundle.js`:

```js
MAKE.decl('BundleNode', {

    'create-test.js-optimizer-node': function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    },

    'create-browser.js-optimizer-node': function(tech, sourceNode, bundleNode) {
        return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
    }

});
```

`browser.js` расширяет технологию `js`, которая, как правило, продуцирует js-файлы, содержащие борщиковые инклуды. Если в вашем случае файлы сразу создаются раскрытыми, `create-browser.js-optimizer-node` указывать не нужно.


#### Добавляем в проект модуль технологии `tests.js`

В папке `.bem/techs` создаем модуль технологии `tests.js`.

По аналогии с https://github.com/narqo/bem-pr/blob/master/docs/howto.ru.md#4--examples .

Содержимое файла:

```js
var PATH = require('path');

exports.baseTechPath = require.resolve('../../bem-pr/bem/techs/tests.js');

exports.getBaseLevel = function() {
    return PATH.resolve(__dirname, '../levels/bundles.js');
};
```

#### Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`

В конфигах `*.sets/.bem/level.js` должен быть указан путь до проектного модуля `tests.js`.

```js
exports.baseLevelPath = require.resolve('../../bem-pr/bem/levels/sets.js');

exports.getTechs = function() {

    return require('bem').util.extend(this.__base() || {}, {
        'examples' : '../../.bem/techs/examples.js',
        'tests' : '../../.bem/techs/tests.js'
    });

};
```

#### Указываем пути до технологий в `.bem/levels/bundles.js`.

В файле `.bem/levels/bundles.js` должны быть указаны пути до технологий `test.js`, `test-tmpl`, `phantomjs`, `browser.js` и `vanilla.js`, которые потребуются при сборке тестов.

```js
...
exports.getTechs = function() {

    return {
        'test.js'       : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/test.js.js'),
        'test-tmpl'     : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/test-tmpl.js'),
        'phantomjs'     : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/phantomjs.js'),
        'browser.js'    : PATH.join(PRJ_ROOT, 'bem-core/.bem/techs/browser.js.js'),
        'vanilla.js'    : PATH.join(PRJ_ROOT, 'bem-core/.bem/techs/vanilla.js.js'),

        'bemjson.js'    : PATH.join(PRJ_TECHS, 'bemjson.js'),
        'bemdecl.js'    : 'bemdecl.js',
        'deps.js'       : 'deps.js',
        'js'            : 'js-i',
        'css'           : 'css',
        'ie.css'        : 'ie.css',
        ...
    };

};
...
```

### Сборка и запуск тестов

Дефолтный тестовый бандл для отдельной бем-сущности:

    $ bem make smth.tests/block.tests/default

    $ bem make smth.tests/block__elem.tests/default

Дефолтный тестовый бандл для всех бем-сущностей в рамках уровня `smth.sets`:

    $ bem make smth.tests/all.tests/default

Рукотворный тестовый бандл:

    $ bem make smth.tests/block.tests/testbundle

    $ bem make smth.tests/block__elem.tests/testbundle

Если в процесс сборки тестовых бандлов была добавлена технология `phantomjs`, то в конце сборки тесты прогонятся через `phantomjs`, вы увидите результаты их выполнения прямо в консоли.

Собранный тестовый бандл можно открыть в браузере, там тоже будут показаны результаты выполнения тестов.


### Демонстрация

    $ git clone git@github.com:mishaberezin/bl-controls
    $ cd bl-controls
    $ npm install
    $ ./node_modules/.bin/bem make bem-pr
    $ ./node_modules/.bin/bem make desktop.sets/attach.tests/01-test
    $ ./node_modules/.bin/bem make desktop.sets/attach.tests/default
