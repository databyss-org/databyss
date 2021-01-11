import { uid } from '@databyss-org/data/lib/uid'
import { DocumentType } from '@databyss-org/data/database/interfaces'
import { EditorState, BlockType } from '../../interfaces'

const initialState: EditorState = {
  preventDefault: false,
  operations: [],
  selection: {
    _id: uid(),
    $type: DocumentType.Selection,
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
