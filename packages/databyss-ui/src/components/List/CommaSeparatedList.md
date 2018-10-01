```js
const authorNames = [
  'Heidegger',
  'Ronell',
  'Kierkegaard',
  'Augustine',
  'Husserl',
]
;<PageNav ariaLabel="other authors">
  [cf.{'\u00A0'}
  <CommaSeparatedList>
    {authorNames.map(name => <Link href="#">{name}</Link>)}
  </CommaSeparatedList>
  ]
</PageNav>
```
