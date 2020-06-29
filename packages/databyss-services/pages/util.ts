import ObjectId from 'bson-objectid'
import { PageState } from '../interfaces'

export const newPage = () => {
  const _refId = ObjectId().toHexString()
  const _id = ObjectId().toHexString()

  const _page: Page = {
    preventDefault: false,
    operations: [],
    selection: {
      _id: ObjectId().toHexString(),
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
    blockCache: {
      [_id]: {
        type: 'ENTRY',
        entityId: _refId,
        _id: _refId,
        text: {
          textValue: '',
          ranges: [],
        },
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
