```js
import Block from './Block'
import { insertCharacterAtIndex } from './state/reducer'
stateValue = require('./_document')

initialState = stateValue

onActiveBlockChange = text => {
  const _state = insertCharacterAtIndex(state, text)
  setState(_state)
}

onActiveBlockIdChange = id => {
  setState({
    activeIndex: initialState.documentView.findIndex(b => b._id === id),
  })
}

onCaretPositionChange = pos => {
  setState({ activeTextOffset: pos })
}
const { activeIndex, activeTextOffset } = state
const getBlockById = (stateValue, id) => {
  return stateValue.blocks[id]
}
activeBlockId = state.documentView[activeIndex]._id
;<ContentEditable
  activeBlockId={activeBlockId}
  caretPosition={activeTextOffset}
  onActiveBlockChange={onActiveBlockChange}
  onActiveBlockIdChange={onActiveBlockIdChange}
  onCaretPositionChange={onCaretPositionChange}
>
  {state.documentView.map(docItem => (
    <Block block={state.blocks[docItem._id]} />
  ))}
</ContentEditable>
```

```js
/*
import { getCaretPosition, setCaretPos } from './../../lib/dom'
import { loremIpsum } from 'lorem-ipsum'
const ipsum = () => loremIpsum({ units: 'words', count: 50 })

let text = ipsum()
;<div
  contentEditable="true"
  onClick={() => console.log(getCaretPosition())}
  data-byss-block
>
  {text}

  <button
    onClick={() =>
      setCaretPos(Math.floor(Math.random() * (+text.length - +0) + +0))
    }
  >
    set random
  </button>
</div>
*/
```
