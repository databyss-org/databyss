import Block from '../../../models/Block'
import Source from '../../../models/Source'
import Entry from '../../../models/Entry'
import Topic from '../../../models/Topic'
import Location from '../../../models/Location'

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
