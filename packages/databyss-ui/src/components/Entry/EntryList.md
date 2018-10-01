```js
initialState = {
  showLinks: false,
}
entries = state.showLinks ? require('./_linkedEntries') : require('./_entries')
;<Content>
  <ContentNav
    left={<BackButton>Sources</BackButton>}
    right={
      <SwitchControl
        label="Motif Links"
        checked={state.showLinks}
        onChange={showLinks => setState({ showLinks })}
        style={{ alignSelf: 'flex-end' }}
      />
    }
  >
    {entries.map((source, _i) => (
      <EntryList key={_i} ariaLabel={source.title}>
        {source.locations.map((location, __i) => (
          <EntryList key={__i} ariaLabel={location.raw}>
            {location.entries.map((entry, ___i) => (
              <Entry
                key={___i}
                {...entry}
                source={source}
                sourceIsRepeat={__i > 0}
                location={location.raw}
                locationIsRepeat={___i > 0}
              />
            ))}
          </EntryList>
        ))}
      </EntryList>
    ))}
  </ContentNav>
</Content>
```
