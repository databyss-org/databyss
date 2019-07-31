```js
import Entry from './Entry'
initialState = {
  showLinks: false,
}
entries = require('./_entries')
;<Content>
  <EntryGroup>
    <EntryGroup>
      <Entry {...entries[0].locations[0].entries[0]} location="p. 106" />
    </EntryGroup>
    <EntryGroup>
      <Entry {...entries[1].locations[1].entries[0]} location="pp. 53-54" />
      <Entry
        {...entries[1].locations[1].entries[1]}
        location="pp. 53-54"
        locationIsRepeat
      />
    </EntryGroup>
  </EntryGroup>
</Content>
```
