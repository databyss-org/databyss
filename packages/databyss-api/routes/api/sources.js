const express = require('express')
const _ = require('lodash')
const router = express.Router()
const Source = require('../../models/Source')
const Author = require('../../models/Author')
const auth = require('../../middleware/auth')

// @route    POST api/sources
// @desc     Add Source
// @access   Private
router.post('/', auth, async (req, res) => {
  /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
*/
  let {
    title,
    authors,
    abbreviation,
    city,
    publishingCompany,
    sourceType,
    url,
    files,
    entries,
    date,
    resource,
    authorFirstName,
    authorLastName,
    _id,
  } = req.body

  let authorPost = {}

  // if new author add author and retrive ID
  if (authorFirstName || authorLastName) {
    authors = authors ? authors : []
    const author = new Author({
      firstName: authorFirstName,
      lastName: authorLastName,
      user: req.user.id,
    })
    authorPost = await author.save()
    authors.push(authorPost._id.toString())
  }

  const sourceFields = {
    title: title ? title : '',
    authors: authors ? authors : [],
    abbreviation: abbreviation ? abbreviation : '',
    city: city ? city : '',
    publishingCompany: publishingCompany ? publishingCompany : '',
    sourceType: sourceType ? sourceType : '',
    url: url ? url : '',
    files: files ? files : '',
    entries: entries ? entries : [],
    date: date ? date : '',
    resource,
    user: req.user.id,
  }
  //if source exists update it and exit
  try {
    let source = await Source.findOne({ _id: _id })
    if (source) {
      if (req.user.id.toString() !== source.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }
      // if new author has been added
      if (_.isArray(source.authors)) {
        if (_.isArray(authors)) {
          appendSourceToAuthor({ authors, sourceId: _id })
        }
      }

      sourceFields._id = _id
      source = await Source.findOneAndUpdate(
        { _id: _id },
        { $set: sourceFields },
        { new: true }
      ).then(response => {
        if (!_.isEmpty(authorPost)) {
          authors = authors ? authors : []
          appendSourceToAuthor({
            authors: authors,
            sourceId: _id.toString(),
          }).then(() => {
            if (!_.isEmpty(entries)) {
              entries = entries ? entries : []
              // if entry exists append the authorID to both entry and source
              appendEntryToAuthor({
                entries: entries,
                authors: authors,
              })
            }
          })
        }
        return res.json(response)
      })
    } else {
      // if new source has been added
      const sources = new Source(sourceFields)
      const post = await sources.save()

      // if authors id exist append to source
      if (authors) {
        if (authors.length > 0) {
          appendSourceToAuthor({
            authors: authors,
            sourceId: post._id.toString(),
          })
        }
      }

      // if entry exists append the authorID to both entry and source
      if (entries) {
        if (entries.length > 0) {
          appendEntryToAuthor({
            entries: entries,
            authors: authors,
          })
        }
      }
      res.json(post)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route    GET api/sources
// @desc     Get source by id
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
  
*/

    const sources = await Source.findOne({
      _id: req.params.id,
    })
    if (!sources) {
      return res.status(400).json({ msg: 'There is no source for this id' })
    }
    if (!sources.default) {
      if (req.user.id.toString() !== sources.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }
    }

    res.json(sources)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route    GET api/sources/
// @desc     Get all sources
// @access   Private

router.get('/', auth, async (req, res) => {
  try {
    const source = await Source.find()
      .or([{ user: req.user.id }, { default: true }])
      .limit(10)
    if (!source) {
      return res.status(400).json({ msg: 'There are no sources' })
    }

    // appendSourceToAuthorList(source)
    //addAuthorId(source)

    res.json(source)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

const appendSourceToAuthor = ({ authors, sourceId }) => {
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

const appendEntryToAuthor = ({ entries, authors }) => {
  const promises = authors.map(async a => {
    if (a) {
      let author = await Author.findOne({
        _id: a,
      }).catch(err => console.log(err))
      if (author) {
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
      }
    }
  })
  return Promise.all(promises)
}

const addAuthorId = sources => {
  const promises = sources.map(async s => {
    if (s) {
      let author = await Author.findOne({
        id: s.author,
      }).catch(err => console.log(err))
      if (author) {
        let newSource = s
        newSource.authors = [author._id]
        let source = await Source.findOneAndUpdate(
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

module.exports = router

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
      } else {
        return acc.concat(obj)
      }
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
            let newInput = author
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
  })
}
