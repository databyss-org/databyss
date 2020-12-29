import ObjectId from 'bson-objectid'
import { Page, BlockType, DocumentType } from '../interfaces'

export const newPage = (): Page => ({
  _id: new ObjectId().toHexString(),
  name: 'untitled',
  archive: false,

  selection: {
    _id: new ObjectId().toHexString(),
    documentType: DocumentType.Selection,
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
