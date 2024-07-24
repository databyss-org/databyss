import { uid } from '@databyss-org/data/lib/uid'

const entryId = uid()

const selectionId = uid()

export default (pageId) => ({
  preventDefault: false,
  operations: [],
  selection: {
    _id: selectionId,
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
  blocks: [
    {
      type: 'ENTRY',
      _id: entryId,
      text: {
        textValue: '',
        ranges: [],
      },
    },
  ],
  pageHeader: {
    _id: pageId,
    name: 'test document',
  },
})
