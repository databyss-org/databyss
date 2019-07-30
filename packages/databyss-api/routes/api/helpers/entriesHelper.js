const Entry = require('../../../models/Entry')
const Author = require('../../../models/Author')
const Source = require('../../../models/Source')

const appendEntryToSource = async ({ sourceId, entryId }) => {
  let source = await Source.findOne({
    _id: sourceId,
  }).catch(err => console.log(err))
  if (source) {
    const newInput = source
    const newEntriesList = newInput.entries
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
        const newInput = author
        const list = newInput.entries
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
        const newInput = author
        const list = newInput.sources
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
      }
      return acc.concat(obj)
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
            const newInput = author
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
    return undefined
  })
}

const appendEntriesToSource = entry => {
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
      }
      return acc.concat(obj)
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
            const newInput = source
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
    return undefined
  })
}

const addAuthorId = entries => {
  const promises = entries.map(async e => {
    if (e) {
      const author = await Author.findOne({
        id: e.authorId,
      }).catch(err => console.log(err))
      if (author) {
        const newEntry = e
        newEntry.author = [author._id]
        await Entry.findOneAndUpdate(
          { _id: e._id },
          { $set: newEntry },
          { new: true }
        )
      }
    }
    return undefined
  })
  return Promise.all(promises)
}

const addSourceId = entries => {
  const promises = entries.map(async e => {
    if (e) {
      const source = await Source.findOne({
        abbreviation: e.sourceId,
      }).catch(err => console.log(err))
      if (source) {
        const newEntry = e
        newEntry.source = source._id
        await Entry.findOneAndUpdate(
          { _id: e._id },
          { $set: newEntry },
          { new: true }
        )
      }
    }
    return undefined
  })
  return Promise.all(promises)
}

const appendSourceToAuthorList = source => {
  const newSource = source.reduce((acc, s) => {
    const obj = {
      author: s.author,
      id: [s._id],
    }
    if (acc.length > 0) {
      if (acc.some(e => e.author === s.author)) {
        const index = acc.findIndex(a => a.author === s.author)
        acc[index].id = acc[index].id.concat(s._id)
        return acc
      }
      return acc.concat(obj)
    }
    return [obj]
  }, [])
  newSource.map(a => {
    if (a) {
      Author.findOne({
        id: a.author,
      })
        .then(author => {
          if (author) {
            const newInput = author
            newInput.sources = a.id
            Author.findOneAndUpdate(
              { id: a.author },
              { $set: newInput },
              { new: true }
            ).catch(err => console.log(err))
          }
        })
        .catch(err => console.log(err))
    }
    return undefined
  })
}

const appendSourceToAuthor = ({ authors, sourceId }) => {
  const promises = authors.map(async a => {
    if (a) {
      let author = await Author.findOne({
        _id: a,
      }).catch(err => console.log(err))
      if (author) {
        const newInput = author
        const list = newInput.sources
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

const appendEntryToAuthor = ({ entries, authors }) => {
  const promises = authors.map(async a => {
    if (a) {
      let author = await Author.findOne({
        _id: a,
      }).catch(err => console.log(err))
      if (author) {
        const newInput = author
        let list = newInput.entries
        list = list.concat(entries.filter(e => list.indexOf(e) < 0))
        // figure out how to remove duplicates
        newInput.entries = list
        author = await Author.findOneAndUpdate(
          { _id: a },
          { $set: newInput },
          { new: true }
        ).catch(err => console.log(err))
      }
    }
    return undefined
  })
  return Promise.all(promises)
}

const addAuthorIdToSource = sources => {
  const promises = sources.map(async s => {
    if (s) {
      const author = await Author.findOne({
        id: s.author,
      }).catch(err => console.log(err))
      if (author) {
        const newSource = s
        newSource.authors = [author._id]
        await Source.findOneAndUpdate(
          { _id: s._id },
          { $set: newSource },
          { new: true }
        )
        /*
        let newInput = author
        let list = newInput.entries
        list = list.concat(entries.filter(e => list.indexOf(e) < 0))
        // figure out how to remove duplicates
        newInput.entries = list
        author = await Author.findOneAndUpdate(
          { _id: a },
          { $set: newInput },
          { new: true }
        ).catch(err => console.log(err))
        */
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
module.exports.appendSourceToAuthorList = appendSourceToAuthorList
module.exports.appendSourceToAuthor = appendSourceToAuthor
module.exports.appendEntryToAuthor = appendEntryToAuthor

module.exports.addAuthorIdToSource = addAuthorIdToSource
