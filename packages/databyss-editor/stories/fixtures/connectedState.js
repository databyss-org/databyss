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
  newEntities: [],
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

export const corruptedPage = pageId => ({
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
    [ObjectId().toHexString()]: {
      type: 'ENTRY',
      _id: ObjectId().toHexString(),
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
