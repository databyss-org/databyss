```js
import { loremIpsum } from 'lorem-ipsum'
const data = new Array(50).fill().map(loremIpsum({ units: 'words', count: 4 }))
;
<List
  renderItem={({item, index, section}) => <Text key={index}>{item}</Text>}
  data={data}
>
```
