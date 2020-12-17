import ObjectId from 'bson-objectid'
import { DbPage } from './interfaces'
import { Selection, Block, DocumentType, BlockType } from '../interfaces'

const _selectionId = new ObjectId().toHexString()

const blockId = new ObjectId().toHexString()

export const initSelection: Selection = {
  documentType: DocumentType.Selection,
  anchor: {
    index: 0,
    offset: 0,
  },
  focus: {
    index: 0,
    offset: 0,
  },
  _id: _selectionId,
}

export const initBlock: Block = {
  text: { textValue: '', ranges: [] },
  type: BlockType.Entry,
  documentType: DocumentType.Block,
  _id: blockId,
}

export const initPage = (_id: string): DbPage => ({
  documentType: DocumentType.Page,
  name: 'default test page',
  _id,
  selection: _selectionId,
  archive: false,
  blocks: [{ _id: blockId, type: BlockType.Entry }],
})
