import PouchDB from 'pouchdb-browser'
import initPageState from '@databyss-org/editor/state/initialState'
import { Block, DocumentType, BlockType, DbPage } from './interfaces'

PouchDB.plugin(require('pouchdb-find').default)
PouchDB.plugin(require('pouchdb-upsert'))

export const db = new PouchDB('local')

// // EXTENDS documentscope to include upsert
// declare module 'PouchDb' {
//   interface DocumentScope<D> {
//     upsert: (docname: string, callback: (oldDocument: D) => D) => D
//   }
// }

// sample initial page

const _testDefaultBlock: Block = {
  text: { textValue: '', ranges: [] },
  type: BlockType.Entry,
  documentType: DocumentType.Block,
  _id: 'test_block_id',
}

const _testDefaultPage: DbPage = {
  documentType: DocumentType.Page,
  name: 'default test page',
  _id: 'test_default_page',
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
  archive: false,
  blocks: [{ _id: 'test_block_id', type: BlockType.Entry }],
}

db.upsert('test_default_page', () => _testDefaultPage)

db.upsert('test_block_id', () => _testDefaultBlock)

db.changes({
  since: 0,
  include_docs: true,
}).then((changes) => {
  console.log('DATABASE.CHANGE', changes)
})
