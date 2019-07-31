```js
import EntryGroup from './EntryGroup'
import Entry from './Entry'
initialState = {
  showLinks: false,
}
locations = require('./_entries')[0].locations
;<Content>
  <EntryGroup>
    <EntriesByLocation
      locations={locations}
      renderEntry={entry => <Entry {...entry} />}
    />
  </EntryGroup>
</Content>
```
