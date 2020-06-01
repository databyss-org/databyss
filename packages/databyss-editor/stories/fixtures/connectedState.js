import ObjectId from 'bson-objectid'

const entryId = ObjectId().toHexString()

const blockOneId = ObjectId().toHexString()

const selectionId = ObjectId().toHexString()

export default pageId => ({
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
  newEntities: [], // renamed from `newAtomics`
  entityCache: {
    [entryId]: {
      type: 'ENTRY',
      _id: entryId,
      text: {
        textValue: '',
        ranges: [],
      },
    },
  },
  blockCache: {
    [blockOneId]: {
      type: 'ENTRY',
      entityId: entryId,
    },
  },
  blocks: [
    {
      _id: blockOneId,
    },
  ],
  page: {
    _id: pageId,
    name: 'test document',
  },
})
