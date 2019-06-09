```js
import CommaSeparatedList from '../List/CommaSeparatedList'
import Link from '../Navigation/Link'
const authorNames = [
  'Heidegger',
  'Ronell',
  'Kierkegaard',
  'Augustine',
  'Husserl',
]
;<PageNav ariaLabel="other authors">
  <CommaSeparatedList opener={'[cf.\u00A0'} closer={']'}>
    {authorNames.map(name => <Link href="#">{name}</Link>)}
  </CommaSeparatedList>
</PageNav>
```
