```js
const loremIpsum = require('lorem-ipsum')
;<ContentNav
  left={<BackButton>Sources</BackButton>}
  right={<SwitchControl label="Motif Links" />}
>
  {loremIpsum({ units: 'sentences', count: 3 })}
</ContentNav>
```

```js
const loremIpsum = require('lorem-ipsum')
;<ContentNav left="SOURCES" right={<ForwardButton>All Entries</ForwardButton>}>
  {loremIpsum({ units: 'sentences', count: 3 })}
</ContentNav>
```
