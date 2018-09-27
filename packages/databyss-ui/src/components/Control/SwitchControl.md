```js
initialState = {
  checked: false,
}
;<Content>
  <SwitchControl
    label="MOTIF LINKS"
    checked={state.checked}
    onChange={checked => setState({ checked })}
  />
  <SwitchControl
    label="MOTIF LINKS (disabled)"
    checked={state.checked}
    onChange={checked => setState({ checked })}
    disabled
  />
</Content>
```
