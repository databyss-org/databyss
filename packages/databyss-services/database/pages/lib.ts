import * as PouchDB from 'pouchdb-browser'
import { Patch } from 'immer'
import ObjectId from 'bson-objectid'
import { getDefaultPageId } from '@databyss-org/services/session/clientStorage'
import { DbPage } from '../interfaces'
import { db } from '../db'
import { initSelection, initPage, initBlock } from '../initialState'
import { Block, BlockType, DocumentType } from '../../interfaces'

export const getAtomicClosureText = (type, text) =>
  ({
    END_SOURCE: `/@ ${text}`,
    END_TOPIC: `/# ${text}`,
  }[type])

const applyPatch = (node, path, value) => {
  const key = path.shift()
  // if path has length one, just set the value and return
  if (path.length === 0) {
    node[key] = value
    return
  }
  // recurse
  applyPatch(node[key], path, value)
}

// same as Object.assign, but filters out unwanted fields
const assignPatchValue = (obj, value) => {
  Object.keys(value).forEach((key) => {
    if (!key.match(/^__/)) {
      obj[key] = value[key]
    }
  })
}

const addOrReplaceBlock = async (p, page) => {
  const _index = p.path[1]
  const { blocks } = page

  // if the blockId isn't in the patch, get it from the page
  let _blockId = p.value._id
  if (!_blockId) {
    _blockId = blocks[_index]._id
  }
  // add or replace entry in blocks array
  const _removeBlockCount = p.op === 'add' ? 0 : 1
  blocks.splice(_index, _removeBlockCount, {
    _id: _blockId,
    type: p.value.type ? p.value.type : 'ENTRY',
  })

  if (p.value.type?.match(/^END_/)) {
    return
  }

  // add or update block
  const _blockFields = {
    _id: _blockId,
    page: page._id,
    account: 'DEFAULT ACCOUNT',
  }

  const _response: PouchDB.Find.FindResponse<Block> = await db.find({
    selector: {
      _id: _blockId,
    },
  })
  let _block: Block | null
  if (_response.docs.length) {
    // populate block
    _block = _response.docs[0]
  } else {
    _block = {
      _id: new ObjectId().toHexString(),
      documentType: DocumentType.Block,
      type: BlockType.Entry,
      text: { textValue: '', ranges: [] },
    }
    // initiate new block
    await db.upsert(_blockId, () => _block)
  }

  Object.assign(_block, _blockFields)
  // if it's an add or we're replacing the whole block, just assign the value
  if (p.op === 'add' || p.path.length === 2) {
    assignPatchValue(_block, p.value)
  } else {
    applyPatch(_block, p.path.slice(2), p.value)
  }

  db.upsert(_block._id, (oldDoc) => ({ ...oldDoc, ..._block }))
}

const replacePatch = async (p, page) => {
  const _prop = p.path[0]
  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p, page)
      break
    }
    case 'selection': {
      const _id = p.value._id
      if (_id) {
        db.upsert(_id, () => p.value)
        // // if new selection._id is passed tag it to page
        page.selection = _id
      }
      break
    }
    default:
  }
}

const addPatch = async (p, page) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p, page)
      break
    }
    default:
  }
}

const removePatches = async (p, page) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      const _index = p.path[1]
      const { blocks } = page
      blocks.splice(_index, 1)
      // TODO: REMOVE BLOCK FROM DB
      break
    }
    default:
  }
}

export const runPatches = async (p: Patch, page: DbPage) => {
  switch (p.op) {
    case 'replace': {
      await replacePatch(p, page)
      break
    }
    case 'add': {
      await addPatch(p, page)
      break
    }
    case 'remove': {
      await removePatches(p, page)
      break
    }
    default:
  }
}

export const initNewPage = async () => {
  // ADD SELECTION DOCUMENT
  await db.upsert(initSelection._id, () => initSelection)

  // ADD BLOCK DOCUMENT
  const _id = getDefaultPageId()
  const _page = initPage(_id)
  await db.upsert(_id, () => _page)

  // ADD PAGE DOCUMENT
  await db.upsert(initBlock._id, () => initBlock)
}
