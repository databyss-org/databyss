import ObjectID from 'bson-objectid'
import Block from '../models/Block'
import BlockRelation from '../models/BlockRelation'
import Page from '../models/Page'
import Selection from '../models/Selection'

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
  Object.keys(value).forEach(key => {
    if (!key.match(/^__/)) {
      obj[key] = value[key]
    }
  })
}

const addOrReplaceBlock = async (p, req) => {
  const _index = p.path[1]
  const { blocks } = req.page

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
    page: req.page._id,
    account: req.account._id,
  }

  let _block = await Block.findOne({ _id: _blockId })
  if (!_block) {
    _block = new Block()
  }
  Object.assign(_block, _blockFields)
  // if it's an add or we're replacing the whole block, just assign the value
  if (p.op === 'add' || p.path.length === 2) {
    assignPatchValue(_block, p.value)
  } else {
    applyPatch(_block, p.path.slice(2), p.value)
  }
  await _block.save()
}

const replacePatch = async (p, req) => {
  const _prop = p.path[0]
  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p, req)
      break
    }
    case 'selection': {
      const _id = p.value._id
      if (_id) {
        await Selection.update({ _id }, { $set: p.value })

        // if new selection._id is passed tag it to page
        const { selection } = req.page
        selection._id = _id
      }
      break
    }
    default:
  }
}

const addPatch = async (p, req) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p, req)
      break
    }
    default:
  }
}

const removePatches = async (p, req) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      const _index = p.path[1]
      const { blocks } = req.page
      blocks.splice(_index, 1)
      // TODO: REMOVE BLOCK FROM DB
      break
    }
    default:
  }
}

export const runPatches = async (p, req) => {
  switch (p.op) {
    case 'replace': {
      await replacePatch(p, req)
      break
    }
    case 'add': {
      await addPatch(p, req)
      break
    }
    case 'remove': {
      await removePatches(p, req)
      break
    }
    default:
  }
}

/**
 * Copies page with @pageId to account with _id @toAccountId
 * Also copies all referenced Blocks and BlockRelations
 * @returns new page _id
 */
export const copyPage = async ({ pageId, toAccountId }) => {
  // Load Page, Block, and BlockRelation records...
  const _page = await Page.findOne({
    _id: pageId,
  })
  const _blocks = await Block.find({
    _id: { $in: _page.blocks.map(b => b._id) },
  })
  const _blockRelations = await BlockRelation.find({
    pageId: _page._id,
  })
  // Reset Page, Block and BlockRelation _ids and account
  const _pageObj = _page.toObject()
  _pageObj._id = new ObjectID().toHexString()
  _pageObj.account = toAccountId
  delete _pageObj.selection

  // map of original block _ids to copied block _ids
  const _blockIdMap = {}

  for (const _block of _blocks) {
    const _blockObj = _block.toObject()
    _blockObj._id = new ObjectID().toHexString()
    _blockObj.account = toAccountId
    await new Block(_blockObj).save()
    _blockIdMap[_block._id] = _blockObj._id
    const _pageBlock = _pageObj.blocks.find(
      b => b._id.toString() === _block._id.toString()
    )
    _pageBlock._id = _blockObj._id
  }

  await new Page(_pageObj).save()

  for (const _blockRelation of _blockRelations) {
    const _blockRelationObj = _blockRelation.toObject()
    _blockRelationObj._id = new ObjectID().toHexString()
    _blockRelationObj.account = toAccountId
    _blockRelationObj.pageId = _pageObj._id
    _blockRelationObj.block = _blockIdMap[_blockRelation.block]
    _blockRelationObj.relatedBlock = _blockIdMap[_blockRelation.relatedBlock]
    if (!_blockRelationObj.block || !_blockRelationObj.relatedBlock) {
      throw new Error('Missing blockIdMap entry or entries')
    }
    await new BlockRelation(_blockRelationObj).save()
  }

  return _pageObj._id
}
