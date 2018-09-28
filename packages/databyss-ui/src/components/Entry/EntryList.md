```js
initialState = {
  showLinks: false,
}
entries = state.showLinks ? require('./linkedEntries') : require('./entries')
;<Content>
  <SwitchControl
    label="Motif Links"
    checked={state.showLinks}
    onChange={showLinks => setState({ showLinks })}
    style={{ alignSelf: 'flex-end' }}
  />
  {entries.map((sourceEntries, _i) => (
    <EntryList key={_i} ariaLabel={sourceEntries[0][0].source.title}>
      {sourceEntries.map((locationEntries, __i) => (
        <EntryList key={__i} ariaLabel={locationEntries[0].location}>
          {locationEntries.map((entry, ___i) => (
            <Entry key={___i} {...entry} />
          ))}
        </EntryList>
      ))}
    </EntryList>
  ))}
</Content>
```
