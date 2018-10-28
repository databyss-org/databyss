```js
initialState = {
  checked: false,
}
;<Content>
  <ToggleControl
    label="toggle"
    checked={state.checked}
    onChange={checked => setState({ checked })}
  >
    <div>{state.checked ? '❤️' : '💔'}</div>
  </ToggleControl>
  <ToggleControl
    label="toggle (disabled)"
    checked={state.checked}
    onChange={checked => setState({ checked })}
    disabled
  >
    <div>{state.checked ? '❤️' : '💔'}</div>
  </ToggleControl>
</Content>
```
