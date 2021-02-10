import { Patch } from 'immer'
import { Block, BlockType } from '@databyss-org/services/interfaces'
import { PageDoc, DocumentType } from '../interfaces'
import { upsert } from '../utils'
import { Page } from '../../../databyss-services/interfaces/Page'
import { savePage } from './'

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
const assignPatchValue = (obj, value, allowed = ['text', 'type', '_id']) => {
  Object.keys(value).forEach((key) => {
    if (allowed.includes(key)) {
      obj[key] = value[key]
    }
  })
}

const addOrReplaceBlock = async (p) => {
  // const _index = p.path[1]
  // const { blocks } = page

  // if the blockId isn't in the patch, get it from the page
  const { _id, textValue, ranges } = p.value
  const _blockId = _id

  // if (!_blockId) {
  //   _blockId = blocks[_index]._id
  // }
  // add or replace entry in blocks array
  // const _removeBlockCount = p.op === 'add' ? 0 : 1
  // blocks.splice(_index, _removeBlockCount, {
  //   _id: _blockId,
  //   type: p.value.type ? p.value.type : 'ENTRY',
  // })

  if (p.value.type?.match(/^END_/)) {
    return
  }

  const _block: Partial<Block> = {
    _id: _blockId,
  }

  // if it's an add or we're replacing the whole block, just assign the value
  if (p.op === 'add' || p.path.length === 2) {
    assignPatchValue(_block, { textValue, ranges })
  } else {
    applyPatch(_block, p.path.slice(2), { textValue, ranges })
  }

  upsert({ $type: DocumentType.Block, _id: _block._id!, doc: _block })
}

const replacePatch = async (p) => {
  const _prop = p.path[0]
  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p)
      break
    }
    case 'selection': {
      const _id = p.value._id
      if (_id) {
        upsert({ $type: DocumentType.Selection, _id, doc: p.value })

        // // if new selection._id is passed tag it to page
        // page.selection = _id
      }
      break
    }
    default:
  }
}

const addPatch = async (p) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p)
      break
    }
    default:
  }
}

const removePatches = async (p) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      // const _index = p.path[1]
      // const { blocks } = page
      // TODO: add this back
      // const _blockId = blocks[_index]._id
      // remove block from db
      // await upsert({
      //   $type: DocumentType.Block,
      //   _id: _blockId,
      //   doc: { _deleted: true },
      // })
      // remove block from page
      // blocks.splice(_index, 1)
      break
    }
    default:
  }
}

export const runPatches = (p: Patch) => {
  switch (p.op) {
    case 'replace': {
      replacePatch(p)
      break
    }
    case 'add': {
      addPatch(p)
      break
    }
    case 'remove': {
      removePatches(p)
      break
    }
    default:
  }
}

export const normalizePage = (page: Page): PageDoc => {
  const _pageDoc: PageDoc = {
    blocks: page.blocks.map((b) => ({ _id: b._id, type: b.type })),
    // blocks: [{ _id: page.blocks[0]._id, type: BlockType.Entry }],
    selection: page.selection._id,
    _id: page._id,
    name: page.name,
    archive: page.archive,
  }
  return _pageDoc
}

/*
generic function to add a new page to database given id. this function is only used in provisioning a new user database
*/
export const addPage = async (id?: string) => {
  const _page = new Page(id)
  await savePage(_page)
  return _page
}
