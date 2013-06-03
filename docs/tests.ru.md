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
	- [Настраиваем сборку `_testbundle.test.js`](#--_testbundletestjs)
	- [Добавляем в проект модуль технологии `tests.js`](#-----testsjs)
	- [Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`](#----testsjs----sets)
	- [Указываем пути до технологий `test.js`, `test-tmpl` и `phantom.js`](#----testjs-test-tmpl--phantomjs)
- [Сборка и запуск тетов](#---)
- [Демонстрация](#-1)

### Абстрактные знания

Тест состоит из двух сущностей: тестовый бандл (раннер) и набор тестов.

Тестовые бандлы оформляются по полной аналогии с примерами, в папке `block.tests`.

Наборы тестов пишутся в технологии `test.js`.

Набор тестов можно сделать как для отдельной bem-сущности (блок, элемент и т.д.), так и для конкретного тестового бандла.

Тесты пишутся под фреймворк Jasmine.


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
В данном случае мы написали тесты для блока, но можно точно также написать их для элемента или модификатора.
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

Более того, для этого конкретного бандла можно задать свой дополнительный уровень переопределения:

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


### Оформление файла `block.test.js`

Тесты пишутся под фреймворк Jasmine.
Единственная специфическая вещь это то, что вместо `describe` используется декларация `BEM.TEST.decl`.
Пример:

    BEM.TEST.decl('block', function() {
        it('Два умножить на два должно равняться четырем', function() {
            expect(2*2).toEqual(4);
        });
    });

Первым параметром передается идентификатор набора тестов. Это может быть строка или хеш такого вида:

    { block: 'block', elem: 'elem', modName: 'modName', modVal: 'modVal' }

Вторым параметром функция, в теле которой собственно тесты.


### Оформление файла `block.tests/testbundle.bemjson.js`

В `testbundle.bemjson.js` пишется произвольный bemjson плюс:
- Подключение `testbundle.test.js`, по аналогии с подключением обычного js;
- Нужно задекларировать элемент `i-bem__test`.

Пример:

    ({
        block: 'b-page',
        head: [
            { elem: 'js', url: 'http://yandex.st/jquery/1.7.2/jquery.min.js' },
            { elem: 'css', url: '_testbundle.css', ie: false },
            { elem: 'js', url: '_testbundle.js' },
            { elem: 'js', url: '_testbundle.test.js' }
        ],
        mods: { theme: 'normal' },
        content: [
            { block: 'i-bem', elem: 'test' },
            { block: 'header' },
            { block: 'content' },
            { block: 'footer' }
        ]
    })


### Оформление элемента `i-bem__test`

`i-bem__test` это специальный элемент, который поставляется с библиотекой `bem-pr`. Он умеет хранить и запускать тесты.
Делает три простые вещи:
- Предоставляет метод для декларации тестового набора: `BEM.TEST.decl`;
- Дает возможность прогнать конкретные наборы тестов из тех, что по зависимостям приехали на страницу;
- Подтягивает за собой тестовый фреймворк (Jasmine).

Есть два способа оформления элемента `i-bem__test` в `testbundle.bemjson.js`.
Запустить все тесты, какие приехали по зависимостям:

    { block: 'i-bem', elem: 'test' }

Запустить тесты конкретных блоков:

    {
        block: 'i-bem',
        elem: 'test',
        content: [
            { block: 'block' },
            { block: 'block', elem: 'elem' },
            { block: 'another-block'},
            ...
        ]
    }


### Проектные настройки

В файле `.bem/make.js`:
- Расширяем класс `TestNode`
- Настраиваем сборку `_testbundle.test.js`

В директории `.bem/techs`:
- Добавляем в проект модуль технологии `tests.js`

В файле `*.sets/.bem/level.js`:
- Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`

В файле `.bem/levels/bundles.js`:
- Указываем пути до технологий `test.js`, `test-tmpl` и `phantom.js`.


#### Расширяем класс TestNode

Сначала нужно настроить сборку примеров (и убедиться, что она работает): https://github.com/narqo/bem-pr/blob/master/docs/howto.ru.md

За сборку тестовых бандлов отвечает класс `TestNode` (он расширяет класс `ExampleNode`).

Расширяем этот класс:
- Добавляем уровень переопределения `bem-pr/test.blocks` (там лежит элемент `i-bem__test`);
- Добавляем технологии `test.js` и `phantom.js` (последний опционально);
- Указываем web-адрес, который смотрит на корень проекта (тоже опционально, но очень желательно).

    MAKE.decl('TestNode', {

        getLevels : function() {
            return this.__base().concat([
                'bem-pr/test.blocks'
            ]);
        },

        getTechs : function() {
            return this.__base().concat([
                'test.js',
                'phantom.js'
            ]);
        },

        webRoot: 'http://islands-page.dev/'
    })

Выше я предполагаю, что полный набор уровней и технологий уже указан для класса `ExampleNode`, здесь я лишь расриряю эти наборы специфичными для тестовых бандлов уровнем и технологиями.

`webRoot` должен быть таким, чтобы от него можно было отложить путь до тестового бандла: `http://islands-page.dev/smth.sets/block.tests/test-bundle/test-bundle.html`.

`webRoot` указывается со слешом на конце.


#### Настраиваем сборку `_testbundle.test.js`

Файл `testbundle.test.js` представляет из себя список борщиковых инклудов с путями до всех файлов *.test.js, пришедших по зависимостям.
Чтобы собирался `_testbundle.test.js` расширяем класс `BundleNode`

    MAKE.decl('BundleNode', {
        'create-test.js-optimizer-node': function(tech, sourceNode, bundleNode) {
            return this.createBorschikOptimizerNode('js', sourceNode, bundleNode);
        }
    });


#### Добавляем в проект модуль технологии `tests.js`

В папке `.bem/techs` создаем модуль технологии `tests.js`.

По аналогии с https://github.com/narqo/bem-pr/blob/master/docs/howto.ru.md#4--examples .

Содержимое файла:

    var PATH = require('path');

    exports.baseTechPath = require.resolve('../../bem-pr/bem/techs/tests.js');

    exports.getBaseLevel = function() {
        return PATH.resolve(__dirname, '../levels/bundles.js');
    };


#### Добавляем путь до технологии `tests.js` в конфиги уровней `*.sets`

В конфигах `*.sets/.bem/level.js` должен быть указан путь до проектного модуля `tests.js`.

    exports.baseLevelPath = require.resolve('../../bem-pr/bem/levels/sets.js');

    exports.getTechs = function() {

        return require('bem').util.extend(this.__base() || {}, {
            'examples' : '../../.bem/techs/examples.js',
            'tests' : '../../.bem/techs/tests.js'
        });

    };


#### Указываем пути до технологий `test.js`, `test-tmpl` и `phantom.js`

В файле `.bem/levels/bundles.js` должны быть указаны пути до технологий `test.js`, `test-tmpl` и `phantom.js`, которые потребуются при сборке тестов.

    ...
    exports.getTechs = function() {

        return {
            'test.js'       : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/test.js.js'),
            'test-tmpl'     : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/test-tmpl.js'),
            'phantom.js'    : PATH.join(PRJ_ROOT, 'bem-pr/bem/techs/phantom.js'),

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


### Сборка и запуск тетов

Дефолтный тестовый бандл:

    $ bem make smth.tests/block.tests/default

    $ bem make smth.tests/block__elem.tests/default

Рукотворный тестовый бандл:

    $ bem make smth.tests/block.tests/testbundle

    $ bem make smth.tests/block__elem.tests/testbundle

Если в процесс сборки тестовых бандлов была добавлена технология `phantom.js`, то в конце сборки тесты прогонятся через `phantomjs`, вы увидите результаты их выполнения прямо в консоли.

Собранный тестовый бандл можно открыть в браузере, там тоже будут показаны результаты выполнения тестов.


### Демонстрация

    $ git clone git@github.com:mishaberezin/bl-controls
    $ cd bl-controls
    $ npm install
    $ ./node_modules/.bin/bem make bem-pr
    $ ./node_modules/.bin/bem make desktop.sets/attach.tests/01-test
    $ ./node_modules/.bin/bem make desktop.sets/attach.tests/default
