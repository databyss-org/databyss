import { uid } from '@databyss-org/data/lib/uid'
import { EditorState, BlockType } from '../../interfaces'

const initialState: EditorState = {
  preventDefault: false,
  operations: [],
  selection: {
    _id: uid(),
    anchor: {
      index: 0,
      offset: 0,
    },
    focus: {
      index: 0,
      offset: 0,
    },
  },
  newEntities: [],
  changedEntities: [],
  removedEntities: [],
  entitySuggestionCache: {},
  blocks: [
    {
      _id: '5e48cdc1dbce857f65e4662d',
      type: BlockType.Entry,
      text: {
        textValue: '',
        ranges: [],
      },
    },
  ],
}

export default initialState
