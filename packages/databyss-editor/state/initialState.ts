import { EditorState } from '../interfaces'

const initialState: EditorState = {
  preventDefault: false,
  showMenuActions: false,
  showFormatMenu: false,
  showNewBlockMenu: true,
  operations: [],
  selection: {
    _id: null,
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
  blocks: [],
  entitySuggestionCache: {},
}

export const addMetaDataToBlocks = (init: EditorState) => {
  let _blocks = init.blocks
  _blocks = _blocks.map(b => ({
    ...b,
    __isActive: false,
    __showNewBlockMenu: false,
    __showCitationMenu: false,
    __showTopicMenu: false,
  }))
  init.blocks = _blocks
  return init
}

export default initialState
