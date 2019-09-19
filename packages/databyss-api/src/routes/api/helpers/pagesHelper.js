const Block = require('../../../models/Block')
const Source = require('../../../models/Source')
const Entry = require('../../../models/Entry')
const Topic = require('../../../models/Topic')
const BadRefId = require('../../../lib/BadRefId')

const getBlockItemsFromId = blocks => {
  const promises = blocks.map(async b => {
    const _id = b._id.toString()
    const block = await Block.findOne({
      _id,
    }).catch(err => console.log(err))
    if (block) {
      const { type, entryId, sourceId, authorId, topicId } = block
      const response = { type, _id }
      response.refId = {
        ENTRY: entryId,
        SOURCE: sourceId,
        TOPIC: topicId,
        AUTHOR: authorId,
      }[type]
      return response
    }
    return {}
  })
  return Promise.all(promises)
}

const populateRefEntities = (list, Model) =>
  Promise.all(
    list.map(async b => {
      const _id = b.refId
      const entity = await eval(Model).findOne({ _id })
      if (!entity) {
        throw new BadRefId(b.refId, 500)
      }
      return { rawHtml: entity.text, _id }
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
