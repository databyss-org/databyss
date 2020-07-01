import Block from '../models/Block'
import Page from '../models/Page'
import Selection from '../models/Selection'

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
  blocks.splice(_index, _removeBlockCount, { _id: _blockId })

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
