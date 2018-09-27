```js
const entries = require('./entries')
;<Content>{entries.map(entry => <Entry content={entry.content} />)}</Content>
```
