const Block = require('../../../models/Block')
const Source = require('../../../models/Source')
const Entry = require('../../../models/Entry')
const Topic = require('../../../models/Topic')
const Location = require('../../../models/Location')

const BadRefId = require('../../../lib/BadRefId')

const modelDict = type =>
  ({
    SOURCE: Source,
    ENTRY: Entry,
    TOPIC: Topic,
    LOCATION: Location,
  }[type])

const getBlockItemsFromId = blocks => {
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

const populateRefEntities = (list, type) =>
  Promise.all(
    list.map(async b => {
      const _id = b.refId
      const entity = await modelDict(type).findOne({ _id })
      if (!entity) {
        throw new BadRefId(b.refId, 500)
      }
      const text = type !== 'SOURCE' ? entity.text : entity.name
      return { text, _id, ranges: entity.ranges }
    })
  )

const dictionaryFromList = list => {
  const result = {}
  list.forEach(b => {
    if (b) {
      result[b._id] = b
    }
  })
  return result
}

module.exports.getBlockItemsFromId = getBlockItemsFromId
module.exports.dictionaryFromList = dictionaryFromList
module.exports.populateRefEntities = populateRefEntities
