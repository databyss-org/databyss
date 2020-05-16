import ObjectId from 'bson-objectid'

export const newPage = () => {
  const _refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  const _page = {
    page: {
      _id: ObjectId().toHexString(),
      name: 'untitled',
      blocks: [{ _id }],
    },
    blocks: {
      [_id]: {
        type: 'ENTRY',
        _id,
        refId: _refId,
      },
    },
    entries: {
      [_refId]: {
        textValue: '',
        ranges: [],
        _id: _refId,
      },
    },
    sources: {},
    topics: {},
  }

  return _page
}
