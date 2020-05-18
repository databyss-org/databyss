import ObjectId from 'bson-objectid'

export const newPage = () => {
  const _refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  const _page = {
    preventDefault: false,
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
    newEntities: [],
    entityCache: {
      [_refId]: {
        type: 'ENTRY',
        _id: _refId,
        text: {
          textValue: '',
          ranges: [],
        },
      },
    },
    blockCache: {
      [_id]: {
        type: 'ENTRY',
        entityId: _refId,
      },
    },
    blocks: [
      {
        _id,
      },
    ],
    page: {
      _id: ObjectId().toHexString(),
      name: 'untitled',
    },
  }
  return _page
}
