```js
list = [{ lastName: 'Heidegger', id: 'HDG' }, { lastName: 'Lacan', id: 'LAC' }]
title = 'Jacques Derrida on 2 TIMES'
el = document.getElementById('rsg-root')
;<CfMobileModal
  onSelect={value => setState(value)}
  list={list}
  appBarCalculatedHeight={0}
  parentRef={el}
  modalTitle={title}
/>
```
