Как использовать библиотеку
===========================

Для корректной работы библиотеки требуются

  - Node.js >= 0.8.x,
  - bem-tools >= 0.5.30

Для того чтобы собирать примеры блоков в своей библиотеки, достаточно выполнить «несколько условий».

### 1. Подключаем bem-pr в проектном make.js

Подключаем bem-pr, по аналогии с другими внешними библиотеками (подробнее про настройку сборки средствами bem-tools,
см. «[Кастомизация сборки](http://ru.bem.info/tools/bem/customization/)»:

    // Arch#getLibraries

    'bem-pr' : {
        type : 'git',
        url  : 'git://github.com/narqo/bem-pr.git',
        npmPackages : false
    }

**NOTE** Рекомендуется на этом же этапе «скачать» библиотеку, выполнив

    › bem make bem-pr

Дальнейшие описание предполагает, что bem-pr скачан и установлен в корень проекта.

### 2. Добавляем цель sets в процесс сборки

bem-pr расширяет стандартный класс `Arch`, добавляя в процесс сборки узлы отвечающие за сборку наборов (sets).

Для добавления в процесс сборки собственных узлов, в новых версиях bem-tools, в класс `Arch` добавлен метод
`createCustomNodes`.

В make.js необходимо определить этот метод, добавив в процесс сборки, узлы из `bem-pr`.

    // PRJ/.bem/make.js

    var setsNodes = require('../bem-pr/bem/nodes/sets');

    MAKE.decl('Arch', {

        // ...

        createCustomNodes : function(common, libs, blocks) {

            return setsNodes.SetsNode
                .create({ root : this.root, arch : this.arch })     // создаем экземпляр узла
                .alterArch();                                       // расширяем процесс сборки новыми узлами из bem-pr

        }

    }

### 3. Настраиваем сборку примеров

Класс **SetsNode** описывает настройки для наборов уровней, они же сэты (sets). Для описания собственных наборов
необходимо определить метод `SetsNode#getSets`.

Метод возращает объект, ключи которого — это название набора, должно совпадать с уровнем переопределения в котором
будут собираться примеры (для набора `desktop`, уровень должен называть `desktop.sets`), а значение — список уровней
переопределения из которых состоит набор, т.е. на котором нужно искать примеры.

    // PRJ/.bem/make.js

    MAKE.decl('SetsNode', {

        getSets : function() {
            return {
                'desktop' : [ 'desktop.blocks' ]
             };
        }

    });

Дополнительно можно настроить сборку примеров, описав используемые в них уровни переопределения и список технологий.
Для этого служит класс `ExampleNode`.

Класс `ExampleNode` расширяет класс `BundleNode` из стандарного набора bem-tools, и описывается теми же методами:
`getTechs`, `getLevels` и пр. Подробнее смотреть в документации к bem-tools.

Итоговый `make.js` проекта, на этом этапе, может выглядеть так:

    // PRJ/.bem/make.js

    try {
        var setsNodes = require('../bem-pr/bem/nodes/sets');
    } catch (e) {
        if(e.code !== 'MODULE_NOT_FOUND')
            throw e;
        setsNodes = false;
    }


    MAKE.dec('Arch', {

        getLibraries : function() {

            return {
                'bem-pr' : {
                    type : 'git',
                    url  : 'git://github.com/narqo/bem-pr.git',
                    npmPackages : false
                }
                // остальные библиотеки
            }

        },

        createCustomNodes : function(common, libs, blocks) {

            if(setsNodes === false) {
                LOGGER.warn('"bem-pr" is not installed');
                return;
            }

            return setsNodes.SetsNode
                .create({ root : this.root, arch : this.arch })
                .alterArch(common, libs.concat(blocks));    // собираем примеры после того как соберутся библиотеки и блоки

        }

    });


    MAKE.decl('SetsNode', {

        getSets : function() {

            return {
                'desktop' : ['desktop.blocks']
            };

        }

    });


    MAKE.decl('ExampleNode', {

        /**
         * Технологии сборки примера
         */
        getTechs : function() {

            return [
                'bemjson.js',
                'bemdecl.js',
                'deps.js',
                'css',
                'js',
                'bemhtml',
                'html'
            ];

        },

        /**
         * Уровни переопределения используемые для сборки примера
         */
        getLevels : function() {

            var resolve = require('path').resolve.bind(null, this.root);
            return [
                'bem-bl/blocks-common',
                'bem-bl/blocks-desktop',
                'lego/blocks-common',
                'lego/blocks-desktop',
                'desktop.blocks'
            ]
            .concat([this.rootLevel.getTech('blocks').getPath(this.getSourceNodePrefix())])     // у каждого примера может быть дополнительно свой уровень переопределения
            .map(resolve);

        }

    });

Создаем уровень наборов, в котором у нас будут собираться примеры:

    › bem make desktop.sets

**NOTE** Технология `sets` должна быть задекларирована в списке технологий _корневого_ конфига уровня:

    // PRJ/.bem/level.js

    exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

    exports.getTechs = function() {

        return {
            'blocks'  : 'bem/lib/techs/blocks',
            'bundles' : 'bem/lib/techs/bundles',
            'sets'    : '../bem-pr/bem/techs/sets'
        };

    };

Либо, если очень хочется «проявить знания утилиты bem»

    › bem create level desktop.sets --level=bem-pr/bem/levels/sets.js --force

_Осталось немного_ :)

### 4. Технология examples

В процессе сборки примеров, bem-pr достраивает недостающие уровни на файловой структуры. Но для того, что в уровнях
примеров использовались правильные конфиги, level.js, нужно определить технологию `examples.js`.

Создаем модуль технологии `.bem/techs/examples.js` и наследуем его от базовой технологии в bem-pr

    // PRJ/.bem/techs/examples.js

    var PATH = require('path');

    // путь до базовой технологии
    exports.baseTechPath = require.resolve('../../bem-pr/bem/techs/examples.js');

    // пеопределяем метод `getBaseLevel`, указываем, что в качестве уровня
    // для собранных примеров нужно использовать уровень бандлов
    exports.getBaseLevel = function() {
        return PATH.resolve(__dirname, '../levels/bundles.js');
    };

В конфиге созданного в конце шага (3), уровня `desktop.sets/.bem/level.js` указываем путь до нашей
технологии `examples`:

    // PRJ/desktop.sets/.bem/level.js

    exports.baseLevelPath = require.resolve('../../bem-pr/bem/levels/sets.js');

    exports.getTechs = function() {

        return require('bem').util.extend(this.__base() || {}, {
            'examples' : '../../.bem/techs/examples.js'
        });

    };

**UPDATE, bem-pr@0.0.4**

Рекомендуется _доопределять_ список технологий, через вызов `bem.util.extend(this.__base(), {...})`,
чтобы конфиги проекта могли наследовать изменения базовых конфигов bem-pr.

---

Примеры это обычные страницы, которые собираются на специальном уровне `desktop.sets/<block-name>.examples/`.

По аналогии со страницами (уровень `*.bundles`), уровням `*.examples` необходим конфиг с мапингом имен технологий
и их реализаций. В общем случае, этот конфиг может совпадать с конфигом страниц.

**NOTE** Обратите внимание, что уровени `<blocks>/block/block.examples` и `<sets>/block.examples` скорее всего должны
иметь разные конфиги, поскольку у них чаще всего отличается способ именования БЭМ-сущностей.

Примеры в `<blocks>/block/block.examples` обычно складываются плоским списком (уровень «simple»):

    › tree -a <blocks>/block/block.examples

    block.examples/
      ├── .bem/
           └── level.js             // exports.baseLevelPath = require.resolve('bem/lib/levels/simple');
      ├── 10-simple.bemjson.js
      ├── 10-simple.title.txt
      ├── 20-complex.bemjson.js
      └── 20-complex.title.txt

На данный момент, bem-tools (версия 0.5.23) не умеет собирать бандлы с плоской структурой. Поэтому структура собранных
примеров должна выглядит как у обычной страницы (бандла):

    › tree -a <sets>
    <sets>/
      ├── .bem/level.js
      ├── block.examples/
           ├── .bem/
                └── level.js        // exports.baseLevelPath = require.resolve('../../.bem/levels/bundles.js');
           ├── 10-simple/
                └── 10-simple.bemjson.js
           └── 20-comples/
                └── 10-comples.bemjson.js

где `<sets>` — уровень наборов, созданный в конце шага (3).

Вот и все!

Для сборки всех примеров, запускаем

    › bem make sets

Но на это может потребоваться много времени, поэтому, для сборки конкретного примера, `10example`,
в блоке `block`, запускаем

    › bem make desktop.sets/block.examples/10example/10example

Либо для пересборки конкретной технологии:

    › bem make desktop.sets/block.examples/10example/10example.css

А еще можно запустить `bem server` и пересобирать пример по запросу:

    › bem server

в браузере открываем (http://localhost:8080/desktop.sets/block.examples/10example/10example.html).

Пример использования можно посмотреть в репозитории (http://github.com/narqo/bl-controls), ветка `feature/bem-pr`.
