```js
initialState = {
  showLinks: false,
}
entries = state.showLinks ? require('./_linkedEntries') : require('./_entries')
;<Content>
  <SwitchControl
    label="Motif Links"
    checked={state.showLinks}
    onChange={showLinks => setState({ showLinks })}
    style={{ alignSelf: 'flex-end' }}
  />
  <Entry {...entries[0][0][0]} />
</Content>
```
