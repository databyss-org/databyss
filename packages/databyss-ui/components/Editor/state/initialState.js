import ObjectId from 'bson-objectid'

const entryId = ObjectId().toHexString()
const blockId = ObjectId().toHexString()
const pageId = ObjectId().toHexString()

export default {
  editableState: null,
  activeBlockId: null,
  sources: {},
  entries: {
    [entryId]: {
      _id: entryId,
      rawHtml: '',
      ranges: [],
    },
  },
  topics: {},
  locations: {},
  blocks: {
    [blockId]: {
      type: 'ENTRY',
      _id: blockId,
      refId: entryId,
    },
  },
  page: {
    _id: pageId,
    name: '',
    blocks: [
      {
        _id: blockId,
      },
    ],
  },
}
