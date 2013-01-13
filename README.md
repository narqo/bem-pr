BEM-PR
======

bem-pr (*/'bʌmpə/, Бампер*) набор узлов для
[bem-make(1)](http://github.com/bem/bem-tools) для решения задач инфраструктуры
библиотек блоков™.

Решаемые задачи
---------------

Сбока БЭМ-сущностей (блоков):

  * примеры блоков
  * тесты (TODO)
  * документация (TODO)

Как пользоваться
----------------

**TODO** написать про _скачать, встроить, запустить сервер, радоваться жизни_.

### Пример

См. ветку `feature/bem-pr` в проекте [bl-controls](http://github.com/narqo/bl-controls).

    ## Используем ветку `feature/bem-pr` в библиотеке bl-controls
    › git clone http://github.com/narqo/bl-controls.git -b feature/bem-pr
    › cd bl-controls

    ## Устанавливаем bem-tools с зависимостями
    › npm install

    ## Устанавлием bem-pr в проект
    ## NOTE: библиотека bem-pr должна быть установлена _до запуска сборки_
    › bem make bem-pr

    ## Запускаем bem-server
    › bem server

Открываем в браузере 
[localhost:8080/desktop.sets/button.examples/10-simple/10-simple.html](http://localhost:8080/desktop.sets/button.examples/10-simple/10-simple.html)

Разрабатываем блок, редактируем пример в `desktop.blocks/button.examples/10-simple.bemjson.js`,
обновляем страницу в браузере.

---

**БЭМ** – это способ описания действительности в коде, набор паттернов и способ
думать о сущностях вне зависимости от того, на каком языке программирования 
это реализуется.

Подробнее о методологии можно прочитать на портале [bem.info](http://ru.bem.info).
