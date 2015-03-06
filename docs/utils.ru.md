Утилиты для написания тестов
============================

Проект `bem-pr` содержит набор утилит для упрощенного написания тестов клиентского кода BEM-блоков, эти утилиты доступны в модуле `spec__utils`.
Пример теста, использующего утилиты:

```js
modules.define('spec', ['spec__utils'], function(provide, utils) {

    describe('test-block', function() {

        var bemjson = {
            block : 'test-block',
            mods : { someMod : 'someVal' }
        };

        it('should init successfully', function() {
            var block = utils.buildBlock('test-block', bemjson);

            block.getMod('someMod').should.equal('someVal');

            utils.destruct(block); // Настоятельно рекомендуем очищать блок после теста
        });

    });
});
```

## Доступные функции

### buildBlock(name, bemjson)

Инициализирует и возвращает BEM-блок `name` на основе переданного `bemjson`.

### destruct(block)

Удаляет блок и DOM-дерева. Рекомендуется вызывать эту функцию после каждого теста для всех созданных блоков.
