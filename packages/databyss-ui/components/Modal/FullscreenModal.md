```js
const { loremIpsum } = require('lorem-ipsum')
initialState = {
  showModal: false,
}
;<div>
  {state.showModal && (
    <FullscreenModal
      onDismiss={() => setState({ showModal: false })}
      title={<PageHeading>Jacques Derrida on "Abyss"</PageHeading>}
      appElementId="rsg-root"
    >
      <Content>{loremIpsum({ units: 'sentences', count: 12 })}</Content>
    </FullscreenModal>
  )}
  <Button onClick={() => setState({ showModal: true })}>
    <p>Fullscreen Modal</p>
  </Button>
</div>
```
