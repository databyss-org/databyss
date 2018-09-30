```js
initialState = {
  showLinks: false
};
sources = state.showLinks ? require("./_linkedEntries") : require("./_entries");
<Content>
  <SwitchControl
    label="Motif Links"
    checked={state.showLinks}
    onChange={showLinks => setState({ showLinks })}
    style={{ alignSelf: "flex-end" }}
  />
  <Entry
    {...sources[0].locations[0].entries[0]}
    source={sources[0]}
    location={sources[0].locations[0].raw}
  />
</Content>;
```
