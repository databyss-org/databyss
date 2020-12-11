import ObjectId from 'bson-objectid'
import { Block, DocumentType, BlockType, DbPage } from './interfaces'
import { Selection } from '../interfaces/Selection'

const _selectionId = new ObjectId().toHexString()

const _pageID = new ObjectId().toHexString()

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
  selection: initSelection,
  archive: false,
  blocks: [{ _id: blockId, type: BlockType.Entry }],
})
