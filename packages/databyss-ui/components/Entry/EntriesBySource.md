```js
import ContentNav from '../Navigation/ContentNav'
import SwitchControl from '../Control/SwitchControl'
import BackButton from '../Button/BackButton'
import Entry from './Entry'
initialState = {
  showLinks: false,
}
sources = state.showLinks ? require('./_linkedEntries') : require('./_entries')
;<Content>
  <ContentNav
    left={<BackButton label="Sources" />}
    right={
      <SwitchControl
        label="Motif Links"
        checked={state.showLinks}
        onChange={showLinks => setState({ showLinks })}
        style={{ alignSelf: 'flex-end' }}
      />
    }
  >
    <EntriesBySource
      sources={sources}
      renderEntry={entry => <Entry {...entry} />}
    />
  </ContentNav>
</Content>
```
