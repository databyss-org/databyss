import ObjectId from 'bson-objectid'

const sourceId = ObjectId().toHexString()
const entryId = ObjectId().toHexString()

const blockOneId = ObjectId().toHexString()
const blockTwoId = ObjectId().toHexString()

export default pageId => ({
  preventDefault: false,
  showMenuActions: false,
  showFormatMenu: false,
  showNewBlockMenu: true,
  operations: [],
  selection: {
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
    [sourceId]: {
      type: 'SOURCE',
      _id: sourceId,
      text: {
        textValue:
          'Stamenov, Language Structure, Discourse and the Access to Consciousness',
        ranges: [{ offset: 0, length: 8, marks: ['bold'] }],
      },
    },
    [entryId]: {
      type: 'ENTRY',
      _id: entryId,
      text: {
        textValue: `On the limitation of \nthird-order thought to assertion`,
        ranges: [
          {
            offset: 7,
            length: 10,
            marks: ['bold'],
          },
          {
            offset: 7,
            length: 10,
            marks: ['italic'],
          },
        ],
      },
    },
  },
  blockCache: {
    blockOneId: {
      type: 'SOURCE',
      entityId: sourceId,
    },
    blockTwoId: {
      type: 'ENTRY',
      entityId: entryId,
    },
  },
  blocks: [
    {
      _id: blockOneId,
    },
    {
      _id: blockTwoId,
    },
  ],
  page: {
    _id: pageId,
    name: 'test document',
  },
})
