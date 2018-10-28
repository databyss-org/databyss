```js
initialState = {
  checked: false,
}
;<Content>
  <SwitchControl
    label="Motif Links"
    checked={state.checked}
    onChange={checked => setState({ checked })}
  />
  <SwitchControl
    label="Motif Links (disabled)"
    checked={state.checked}
    onChange={checked => setState({ checked })}
    disabled
  />
</Content>
```
