import Block from '../../../models/Block'
import Source from '../../../models/Source'
import Entry from '../../../models/Entry'
import Topic from '../../../models/Topic'
import Location from '../../../models/Location'
import Page from '../../../models/Page'
import Selection from '../../../models/Selection'

const BadRefId = require('../../../lib/BadRefId')

export const modelDict = type =>
  ({
    SOURCE: Source,
    ENTRY: Entry,
    TOPIC: Topic,
    LOCATION: Location,
  }[type])

const getIdType = type =>
  ({
    ENTRY: 'entryId',
    SOURCE: 'sourceId',
    TOPIC: 'topicId',
  }[type])

export const getBlockItemsFromId = blocks => {
  const promises = blocks.map(async b => {
    const _id = b._id.toString()
    const block = await Block.findOne({
      _id,
    }).catch(err => console.log(err))
    if (block) {
      const { type, entryId, sourceId, authorId, topicId, locationId } = block
      const response = { type, _id }
      response.refId = {
        ENTRY: entryId,
        SOURCE: sourceId,
        TOPIC: topicId,
        LOCATION: locationId,
        AUTHOR: authorId,
      }[type]
      return response
    }
    return {}
  })
  return Promise.all(promises)
}

export const populateRefEntities = (list, type) =>
  Promise.all(
    list.map(async b => {
      const _id = b.refId
      const entity = await modelDict(type).findOne({ _id })
      if (!entity) {
        throw new BadRefId(b.refId, 500)
      }
      return {
        textValue: entity.text.textValue,
        type,
        _id,
        ranges: entity.text.ranges,
      }
    })
  )

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

const addOrReplaceBlockCache = async (p, req) => {
  const _blockId = p.path[1]
  const _type = typeof p.value === 'string' ? p.value : p.value.type

  let _block = await Block.findOne({ _id: _blockId })

  // payload when replacing block may not cointain entity id
  const _entityId = p.value.entityId
    ? p.value.entityId
    : _block[getIdType(_block.type)]

  // set property name
  const idType = {
    ENTRY: { entryId: _entityId },
    SOURCE: { sourceId: _entityId },
    TOPIC: { topicId: _entityId },
  }[_type]

  const blockFields = {
    type: _type,
    user: req.user.id,
    account: req.account._id,
    ...idType,
  }

  if (!_block) {
    _block = new Block({ _id: _blockId })
  }

  _block.overwrite(blockFields)

  await _block.save()
}

const addOrReplaceBlock = async (p, req) => {
  const _index = p.path[1]
  // insert block id into page
  const _page = await Page.findOne({ _id: req.page._id })
  const blocks = _page.blocks
  blocks.splice(_index, 1, { _id: p.value._id })
  await _page.save()
}

const replacePatch = async (p, req) => {
  const _prop = p.path[0]
  switch (_prop) {
    case 'entityCache': {
      await modelDict(p.value.type).findOneAndUpdate(
        { _id: p.path[1] },
        {
          text: {
            textValue: p.value.textValue,
            ranges: p.value.ranges,
          },
        }
      )
      break
    }
    case 'blockCache': {
      await addOrReplaceBlockCache(p, req)
      break
    }
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
      break
  }
}

const addPatch = async (p, req) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      await addOrReplaceBlock(p, req)
      break
    }
    case 'blockCache': {
      await addOrReplaceBlockCache(p, req)
      break
    }
    case 'entityCache': {
      const _blockId = p.value._id

      const idType = getIdType(p.value.type)

      const _block = await Block.findOne({ [idType]: _blockId })

      const entityFields = {
        text: p.value.text ? p.value.text : p.value,
        _id: p.path[1],
        page: req.page._id,
        ...(_block && {
          block: _block._id,
        }),
        account: req.account._id,
      }
      /* eslint-disable-next-line new-cap */
      const _entity = new modelDict(p.value.type)(entityFields)

      await _entity.save()
      break
    }
    default:
      break
  }
}

const removePatches = async (p, req) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'entityCache': {
      // TODO: REMOVE ENTITY FROM DB
      break
    }
    case 'blockCache': {
      // TODO: REMOVE BLOCK FROM DB
      break
    }
    case 'blocks': {
      const _index = p.path[1]
      const _page = await Page.findOne({ _id: req.page._id })
      const blocks = _page.blocks
      blocks.splice(_index, 1)
      await _page.save()
      break
    }
    default:
      break
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
      break
  }
}
