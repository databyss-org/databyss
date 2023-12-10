import { Block, ExtendedPatch } from '@databyss-org/services/interfaces'
import { PageDoc, DocumentType } from '../interfaces'
import { upsert, upsertImmediate } from '../utils'
import { Page } from '../../../databyss-services/interfaces/Page'
import { BlockReference } from '../../../databyss-services/interfaces/Block'

const applyPatch = (node, path, value) => {
  const key = path.shift()
  // if path has length one, just set the value and return
  if (path.length === 0) {
    node[key] = value
    return
  }

  // TODO: this might break the patches. check test runner
  if (!node[key]) {
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
  // if the blockId isn't in the patch, get it from the page
  const { _id, textValue, ranges, type } = p.value
  const _blockId = _id

  if (p.value.type?.match(/^END_/)) {
    return
  }

  const _block: Partial<Block> = {
    _id: _blockId,
  }

  // if it's an add or we're replacing the whole block, just assign the value
  if (p.op === 'add' || p.path.length === 2) {
    assignPatchValue(_block, p.value)
  } else {
    applyPatch(_block, p.path.slice(2), { textValue, ranges })
    _block.type = type
  }

  // console.log('[addOrReplaceBlock]', _id, p.sharedWithGroups)

  upsert({
    doctype: DocumentType.Block,
    _id: _block._id!,
    doc: {
      ..._block,
      sharedWithGroups: p.sharedWithGroups,
    },
  })
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
        upsert({ doctype: DocumentType.Selection, _id, doc: p.value })
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
      //   doctype: DocumentType.Block,
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

export const runPatches = (p: ExtendedPatch) => {
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
    selection: page.selection._id!,
    _id: page._id,
    name: page.name,
    archive: page.archive,
  }
  return _pageDoc
}

/*
generic function to add a new page to database given id. this function is a promise and bypasses the queue
*/
export const addPage = async (page: Page) => {
  await upsertImmediate({
    doctype: DocumentType.Selection,
    _id: page.selection._id,
    doc: page.selection,
  })
  await upsertImmediate({
    doctype: DocumentType.Block,
    _id: page.blocks[0]._id,
    doc: { ...page.blocks[0] },
  })
  await upsertImmediate({
    doctype: DocumentType.Page,
    _id: page._id,
    doc: normalizePage(page),
  })

  return page
}

export const didBlocksChange = ({
  blocksAfter,
  blocksBefore,
}: {
  blocksBefore: BlockReference[]
  blocksAfter: BlockReference[]
}) =>
  !blocksAfter.reduce((acc, blockAfter, idx) => {
    const _blockBefore = blocksBefore[idx]
    if (
      acc &&
      blockAfter?.type === _blockBefore?.type &&
      blockAfter?._id === _blockBefore?._id
    ) {
      return true
    }
    return false
  }, true)
