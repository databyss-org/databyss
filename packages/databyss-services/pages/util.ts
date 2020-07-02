import ObjectId from 'bson-objectid'
import { Page, BlockType } from '../interfaces'

export const newPage = (): Page => ({
  _id: new ObjectId().toHexString(),
  name: 'untitled',
  archive: false,
  selection: {
    _id: new ObjectId().toHexString(),
    focus: {
      offset: 0,
      index: 0,
    },
    anchor: {
      offset: 0,
      index: 0,
    },
  },
  blocks: [
    {
      _id: new ObjectId().toHexString(),
      type: BlockType.Entry,
      text: { textValue: '', ranges: [] },
    },
  ],
})
