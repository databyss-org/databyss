```js
import Link from '../Navigation/Link'
sources = require('./_sources')
;<TocList>{sources.map(source => <Link href="#">{source}</Link>)}</TocList>
```
