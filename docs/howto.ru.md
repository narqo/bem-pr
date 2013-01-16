Как использовать библиотеку
===========================

Для корректной работы библиотеки требуются: 
  - Node.js >= **0.8.x**,
  - bem-tools, ветка **introspect** (`github.com/bem/bem-tools.git#introspect`)

Для того чтобы собирать примеры блоков в своей библиотеки, достаточно выполнить несколько условий.

### 1. Подключаем bem-pr в проектном make.js

Подключаем bem-pr, по аналогии с другими внешними библиотеками (подробнее про настройку сборки средствами bem-tools,
см. «[Кастомизация сборки](http://ru.bem.info/tools/bem/customization/)»)

    // Arch#getLibraries

    'bem-pr' : {
      type : 'git',
      url  : 'git://github.com/narqo/bem-pr.git',
      npmPackages : false
    }


### 2. Добавляем цель sets в процесс сборки

bem-pr расширяет стандартный класс `Arch`, добавляя в процесс сборки узлы отвечающие за сборку наборов (sets).

Для добавления в процесс сборки собственных узлов, в новых версиях bem-tools, в класс `Arch` добавлен метод
`createCustomNodes`. В `make.js` необходимо определить этот метод, добавив в процесс сборки, узлы из bem-pr.

    // Arch#createCustomNodes

    createCustomNodes : function() {

      require('<путь-до>/bem-pr/bem/nodes/sets').SetsNode
        .create({ root : this.root, arch : this.arch })     // создаем экземпляр узла
        .alterArch();                                       // расширяем процесс сборки новыми узлами из bem-pr

    }

### 3. Настраиваем сборку примеров

Класс `SetsNode` описывает настройки для наборов уровней, они же сэты (*sets*). Для описания собственных наборов
необходимо определить метод `SetsNode#getSets`.

Метод возращает объект, ключи которого — это название сета, должно совпадать с уровнем переопределения в котором
будут собираться примеры (для набора `desktop`, уровень будет называть `desktop.sets`), а значение — список уровней
переопределения из которых состоит набор, т.е. на котором нужно искать примеры.

    // prj/.bem/make.js

    MAKE.decl('SetsNode', {

      getSets : function() {
        return {
          'desktop' : [ 'desktop.blocks' ]
        }
      }

    });

Дополнительно можно настроить сборку примеров, описав используемые в них уровни переопределения и список технологий. Для
этого служит класс `ExampleNode`.

Класс `ExampleNode` расширяет класс `BundleNode` из стандарного набора bem-tools, и описывается теми же методами:
`getTechs`, `getLevels` и пр. Подробнее смотреть в документации к bem-tools.

Итоговый `make.js` проекта может выглядеть так:

    // PRJ/.bem/make.js

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

          try {
            var setsNodes = require('../bem-pr/bem/nodes/sets');
          } catch(e) {
            if(e.code !== 'MODULE_NOT_FOUND')
                throw e;
            // при первом запуске, когда bem-pr еще не скачен, ничего не делаем
            return;
          }

          return setsNodes.SetsNodes
            .create({ root : this.root, arch : this.arch })
            .alterArch(common, libs.concat(blocks));

      }

    }


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
          'bemhtml.js',
          'html'
        ];

      }

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
          'bl-controls/desktop.blocks',
          'desktop.blocks'
        ]
        .concat([this.rootLevel.getTech('blocks').getPath(this.getSourceNodePrefix())])     // у каждого примера может быть дополнительно свой уровень переопределения
        .map(resolve);

      }

    });

Устанавливаем bem-pr, создаем уровень сэтов

    › bem make bem-pr
    › bem make desktop.sets

Осталось немножко :)

### 4. Технология examples

В процессе сборки примеров, bem-pr достраивает недостающие уровни на файловой структуры. Но для того, что в уровнях
примеров использовались правильные конфиги, level.js, нужно определить технологию `examples.js`

Создаем модуль технологии `.bem/techs/examples.js` и наследуем его от базовой технологии в bem-pr

    // PRJ/.bem/techs/examples.js

    var PATH = require('path');

    // путь до базовой технологии
    exports.baseTechPath = require.resolve('../../bem-pr/bem/techs/examples.js');

    // пеопределяем метод `getBaseLevel`, указываем, что в качестве уровня для собранных примеров нужно использовать уровень бандлов
    exports.getBaseLevel = function() {
        return PATH.resolve(__dirname, '../levels/bundles.js');
    };

В конфиге созданного уровня `desktop.sets/.bem/level.js` указываем путь до нашей технологии `examples`:

    // PRJ/desktop.sets/.bem/level.js

    exports.getTechs = {
      'examples' : '../../.bem/techs/examples.js'
    };

**NOTE** Конфиг уровня `desktop.sets` имеет смысл добавить в систему контроля версий библиотеки. Внутренности уровеня 
можно добавить в игнор.

Примеры это обычные страницы, которые собираются на специальном уровне `desktop.sets/<block-name>.examples/`. По
аналогии со страницами (уровень `*.bundles`), уровням `*.examples` необходим конфиг с мапингом имен технологий и их
реализаций. В общем случае этот конфиг может совпадать с конфигом страниц.

Обратите внимание, что уровени `blocks/block/block.examples` и `sets/block.examples` скорее всего должны
иметь разные конфиги, поскольку у них чаще всего отличается способ именования БЭМ-сущностей.

Примеры в `blocks/block/block.examples` обычно складываются плоским списком (уровень «simple»)

    › tree -a blocks/block/block.examples

    block.examples/
      ├── .bem/
           └── level.js             // exports.baseLevelPath = require.resolve('bem/lib/levels/simple);
      ├── 10-simple.bemjson.js
      ├── 10-simple.title.txt
      ├── 20-complex.bemjson.js
      └── 20-complex.title.txt

На данный момент, bem-tools (версия 0.5.23) не умеет собирать бандлы с плоской структурой. Поэтому структура собранных 
примеров выглядит как у обычной страницы (бандла).

    › tree -a sets
    sets/
      ├── .bem/level.js
      ├── block.examples/
           ├── .bem/
                └── level.js        // exports.baseLevelPath = require.resolve('../../.bem/levels/bundles.js');
           ├── 10-simple/
                └── 10-simple.bemjson.js
           └── 20-comples/
                └── 10-comples.bemjson.js

**NOTE** Также будет правильным добавить технологию `sets` в список технологий корневого конфига уровня:

    // PRJ/.bem/level.js
    exports.baseLevelPath = require.resolve('bem/lib/levels/simple');

    exports.getTechs = {
      'blocks'  : 'bem/lib/techs/blocks',
      'bundles' : 'bem/lib/techs/bundles',
      'sets'    : '../bem-pr/bem/techs/sets.js'
    };

Вот и все!

Для сборки всех примеров, запускаем

    › bem make sets

На это может потребоваться много времени, поэтому, для сборки конкретного примера `10example`, блока `block`, запускаем

    › bem make desktop.sets/block.examples/10example

Либо для сборки конкретной технологии:

    › bem make desktop.sets/block.examples/10example/10example.css

А еще можно запустить `bem server` и пересобирать пример по запросу:

    › bem server

в браузере открываем 
[http://localhost:8080/desktop.sets/block.examples/10example/10example.html](http://localhost:8080/desktop.sets/block.examples/10example/10example.html).

Пример использования можно посмотреть в репозитории (http://github.com/narqo/bl-controls), ветка `feature/bem-pr`.
