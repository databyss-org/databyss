const Block = require('../../../models/Block')
const Source = require('../../../models/Source')
const Entry = require('../../../models/Entry')

const getBlockItemsFromId = blocks => {
  const promises = blocks.map(async b => {
    const _id = b._id
    const block = await Block.findOne({
      _id,
    }).catch(err => console.log(err))
    const { type, entryId, sourceId, authorId } = block
    let response = { type, _id }
    if (type === 'ENTRY') {
      response.refId = entryId
    }
    if (type === 'SOURCE') {
      response.refId = sourceId
    }
    return response
  })
  return Promise.all(promises)
}

const getSourcesFromId = list => {
  const promises = list.map(async b => {
    const _id = b.refId
    const source = await Source.findOne({
      _id,
    }).catch(err => console.log(err))
    const { resource } = source
    let response = { rawHtml: resource, _id }
    return response
  })
  return Promise.all(promises)
}

const getEntriesFromId = list => {
  const promises = list.map(async b => {
    const _id = b.refId
    const entryResponse = await Entry.findOne({
      _id,
    }).catch(err => console.log(err))
    const { entry } = entryResponse
    let response = { rawHtml: entry, _id }
    return response
  })
  return Promise.all(promises)
}

const dictionaryFromList = list => {
  let result = {}
  list.forEach(b => {
    result[b._id] = b
  })
  return result
}

module.exports.getBlockItemsFromId = getBlockItemsFromId
module.exports.dictionaryFromList = dictionaryFromList
module.exports.getSourcesFromId = getSourcesFromId
module.exports.getEntriesFromId = getEntriesFromId
