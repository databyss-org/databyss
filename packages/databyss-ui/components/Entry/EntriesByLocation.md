```js
initialState = {
  showLinks: false,
}
locations = require('./_entries')[0].locations
;<Content>
  <EntryGroup>
    <EntriesByLocation locations={locations}>
      <Entry />
    </EntriesByLocation>
  </EntryGroup>
</Content>
```
