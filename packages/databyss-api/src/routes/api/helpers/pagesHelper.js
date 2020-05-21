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
      const _blockId = p.path[1]
      const _type = typeof p.value === 'string' ? p.value : p.value.type

      const _block = await Block.findOne({ _id: _blockId })

      let _entityId
      if (p.value.entityId) {
        _entityId = p.value.entityId
      } else {
        // get property name from DB
        _entityId =
          _block[
            {
              ENTRY: 'entryId',
              SOURCE: 'sourceId',
              TOPIC: 'topicId',
            }[_block.type]
          ]
      }

      // set property name
      const idType = {
        ENTRY: { entryId: _entityId },
        SOURCE: { sourceId: _entityId },
        TOPIC: { topicId: _entityId },
        AUTHOR: { authorId: _entityId },
        LOCATION: { locationId: _entityId },
      }[_type]

      const blockFields = {
        type: _type,
        _id: _blockId,
        user: req.user.id,
        account: req.account._id,
        ...idType,
      }

      // TODO: old idType still exists in database
      await Block.findOneAndUpdate({ _id: _blockId }, blockFields, {
        new: true,
      })

      break
    }
    case 'blocks': {
      const _index = p.path[1]
      // insert block id into page
      const _page = await Page.findOne({ _id: req.page._id })
      const blocks = _page.blocks
      blocks.splice(_index, 1, { _id: p.value._id })
      await Page.findOneAndUpdate({ _id: req.page._id }, { blocks })

      break
    }
    case 'selection': {
      const _id = p.value._id
      await Selection.findByIdAndUpdate({ _id }, { $set: p.value })

      break
    }
    default:
      break
  }
}

const addPatch = async (p, _cache, req) => {
  const _prop = p.path[0]

  switch (_prop) {
    case 'blocks': {
      const _index = p.path[1]
      // insert block id into page
      const _page = await Page.findOne({ _id: req.page._id })
      const blocks = _page.blocks
      blocks.splice(_index, 0, { _id: p.value._id })
      await Page.findOneAndUpdate({ _id: req.page._id }, { blocks })

      break
    }
    case 'blockCache': {
      const _type = p.value.type
      const _entityId = p.value.entityId
      const _blockId = p.path[1]

      // add entity id to temporary cache
      _cache[_entityId] = _blockId

      const idType = {
        ENTRY: { entryId: _entityId },
        SOURCE: { sourceId: _entityId },
        TOPIC: { topicId: _entityId },
        AUTHOR: { authorId: _entityId },
        LOCATION: { locationId: _entityId },
      }[_type]

      const blockFields = {
        type: _type,
        _id: _blockId,
        user: req.user.id,
        account: req.account._id,
        ...idType,
      }

      const _block = new Block(blockFields)
      await _block.save()
      break
    }
    case 'entityCache': {
      const entityFields = {
        text: p.value.text ? p.value.text : p.value,
        _id: p.path[1],
        page: req.page._id,
        ...(_cache[p.value._id] && {
          block: _cache[p.value._id],
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
      await Page.findOneAndUpdate({ _id: req.page._id }, { blocks })
      break
    }
    default:
      break
  }
}

export const runPatches = async (p, _cache, req) => {
  switch (p.op) {
    case 'replace': {
      await replacePatch(p, req)
      break
    }
    case 'add': {
      await addPatch(p, _cache, req)
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
