# simulate-dom-event

simulate dom event across browser. it is only suitable for test purpose!

[![simulate-dom-event](https://nodei.co/npm/simulate-dom-event.png)](https://npmjs.org/package/simulate-dom-event)
[![NPM downloads](http://img.shields.io/npm/dm/simulate-dom-event.svg)](https://npmjs.org/package/simulate-dom-event)
[![Dependency Status](https://gemnasium.com/yiminghe/simulate-dom-event.png)](https://gemnasium.com/yiminghe/simulate-dom-event)
[![Bower version](https://badge.fury.io/bo/simulate-dom-event.svg)](http://badge.fury.io/bo/simulate-dom-event)
[![node version](https://img.shields.io/badge/node.js-%3E=_0.10-green.svg?style=flat-square)](http://nodejs.org/download/)


## exmaple
```html
<script src='index.js'></script>
<div id='t'></div>
<script>
    var t = document.getElementById('t');
    t.addEventListener('click',function(e){
        alert(e.which);
    },false);
    window.simulateEvent(t,'click',{
        which:2
    });
</script>
```