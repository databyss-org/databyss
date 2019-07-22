const Entry = require('../../../models/Entry')
const Author = require('../../../models/Author')
const Source = require('../../../models/Source')

const appendEntryToSource = async ({ sourceId, entryId }) => {
  let source = await Source.findOne({
    _id: sourceId,
  }).catch(err => console.log(err))
  if (source) {
    let newInput = source
    let newEntriesList = newInput.entries
    if (newEntriesList.indexOf(entryId) > -1) return
    newEntriesList.push(entryId)
    newInput.entries = newEntriesList
    source = await Source.findOneAndUpdate(
      { _id: sourceId },
      { $set: newInput },
      { new: true }
    ).catch(err => console.log(err))
  }
}

const appendEntryToAuthors = ({ authors, entryId }) => {
  const promises = authors.map(async a => {
    if (a) {
      let author = await Author.findOne({
        _id: a,
      }).catch(err => console.log(err))
      if (author) {
        let newInput = author
        let list = newInput.entries
        if (list.indexOf(entryId) > -1) return
        list.push(entryId)
        newInput.entries = list
        author = await Author.findOneAndUpdate(
          { _id: a },
          { $set: newInput },
          { new: true }
        ).catch(err => console.log(err))
      }
    }
  })
  return Promise.all(promises)
}

// migration tools

const appendAuthorToSource = ({ sourceId, authors }) => {
  const promises = authors.map(async a => {
    if (a) {
      let author = await Author.findOne({
        _id: a,
      }).catch(err => console.log(err))
      if (author) {
        let newInput = author
        let list = newInput.sources
        if (list.indexOf(sourceId) > -1) return
        list.push(sourceId)
        newInput.sources = list
        author = await Author.findOneAndUpdate(
          { _id: a },
          { $set: newInput },
          { new: true }
        ).catch(err => console.log(err))
      }
    }
  })
  return Promise.all(promises)
}

const appendEntryToAuthorList = entry => {
  const newEntry = entry.reduce((acc, e) => {
    const obj = {
      author: e.authorId,
      id: [e._id],
    }
    if (acc.length > 0) {
      if (acc.some(i => i.author === e.authorId)) {
        const index = acc.findIndex(a => a.author === e.authorId)
        acc[index].id = acc[index].id.concat(e._id)
        return acc
      } else {
        return acc.concat(obj)
      }
    }
    return [obj]
  }, [])

  newEntry.map(a => {
    if (a) {
      Author.findOne({
        id: a.author,
      })
        .then(author => {
          if (author) {
            let newInput = author
            newInput.entries = a.id
            Author.findOneAndUpdate(
              { id: a.author },
              { $set: newInput },
              { new: true }
            ).catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    }
  })
}

appendEntriesToSource = entry => {
  const newEntry = entry.reduce((acc, e) => {
    const obj = {
      source: e.sourceId,
      id: [e._id],
    }
    if (acc.length > 0) {
      if (acc.some(i => i.source === e.sourceId)) {
        const index = acc.findIndex(a => a.source === e.sourceId)
        acc[index].id = acc[index].id.concat(e._id)
        return acc
      } else {
        return acc.concat(obj)
      }
    }
    return [obj]
  }, [])

  newEntry.map(a => {
    if (a) {
      Source.findOne({
        abbreviation: a.source,
      })
        .then(source => {
          if (source) {
            let newInput = source
            newInput.entries = a.id
            Source.findOneAndUpdate(
              { abbreviation: a.source },
              { $set: newInput },
              { new: true }
            ).catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    }
  })
}

const addAuthorId = entries => {
  const promises = entries.map(async e => {
    if (e) {
      let author = await Author.findOne({
        id: e.authorId,
      }).catch(err => console.log(err))
      if (author) {
        let newEntry = e
        newEntry.author = [author._id]
        let entry = await Entry.findOneAndUpdate(
          { _id: e._id },
          { $set: newEntry },
          { new: true }
        )
      }
    }
  })
  return Promise.all(promises)
}

const addSourceId = entries => {
  const promises = entries.map(async e => {
    if (e) {
      let source = await Source.findOne({
        abbreviation: e.sourceId,
      }).catch(err => console.log(err))
      if (source) {
        let newEntry = e
        newEntry.source = source._id
        let entry = await Entry.findOneAndUpdate(
          { _id: e._id },
          { $set: newEntry },
          { new: true }
        )
      }
    }
  })
  return Promise.all(promises)
}

module.exports.appendEntryToSource = appendEntryToSource
module.exports.appendEntryToAuthors = appendEntryToAuthors
module.exports.appendAuthorToSource = appendAuthorToSource
module.exports.appendEntryToAuthorList = appendEntryToAuthorList
module.exports.appendEntriesToSource = appendEntriesToSource
module.exports.addAuthorId = addAuthorId
module.exports.addSourceId = addSourceId
