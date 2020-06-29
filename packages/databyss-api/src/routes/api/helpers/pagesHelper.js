import { isAtomicInlineType } from '@databyss-org/editor/lib/util'
import Block from '../../../models/Block'
import Page from '../../../models/Page'
import Selection from '../../../models/Selection'
import { ApiError } from '../../../lib/Errors'

export const dictionaryFromList = list => {
  const result = {}
  list.forEach(b => {
    if (b) {
      result[b._id] = b
    }
  })
  return result
}

export const composeBlockList = list => {
  const result = {}
  list.forEach(b => {
    if (b) {
      result[b._id] = { type: b.type, entityId: b.refId }
    }
  })
  return result
}

const addOrReplaceBlock = async (p, req) => {
  const _index = p.path[1]
  // insert block id into page
  const _page = await Page.findOne({ _id: req.page._id })
  const blocks = _page.blocks
  const _removeBlockCount = p.op === 'add' ? 0 : 1
  blocks.splice(_index, _removeBlockCount, { _id: p.value._id })
  await _page.save()
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
      const _page = await Page.findOne({ _id: req.page._id })
      const blocks = _page.blocks
      blocks.splice(_index, 1)
      await _page.save()
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
