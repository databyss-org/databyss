Uses `dangerouslySetInnerHTML` to render raw markup.  
**😬Use with caution 😬**

```js
const loremIpsum = require('lorem-ipsum')
;<Raw html={loremIpsum({ format: 'html', units: 'paragraphs', count: 3 })} />
```
