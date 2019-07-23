const express = require('express')

const _ = require('lodash')

const router = express.Router()

const Source = require('../../models/Source')

const Author = require('../../models/Author')

const auth = require('../../middleware/auth')

const helpers = require('./helpers/entriesHelper')

const {
  // appendSourceToAuthorList,
  // addAuthorIdToSource,
  appendSourceToAuthor,
  appendEntryToAuthor,
} = helpers

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

  let { entries, authors } = req.body
  const {
    title,
    abbreviation,
    city,
    publishingCompany,
    sourceType,
    url,
    files,
    date,
    resource,
    authorFirstName,
    authorLastName,
    _id,
  } = req.body

  let authorPost = {}

  // if new author add author and retrive ID
  if (authorFirstName || authorLastName) {
    authors = !_.isEmptyisEmpty(authors) ? authors : []
    const author = new Author({
      firstName: authorFirstName,
      lastName: authorLastName,
      user: req.user.id,
    })
    authorPost = await author.save()
    authors.push(authorPost._id.toString())
  }

  const sourceFields = {
    title: !_.isEmpty(title) ? title : '',
    authors: !_.isEmpty(authors) ? authors : [],
    abbreviation: !_.isEmpty(abbreviation) ? abbreviation : '',
    city: !_.isEmpty(city) ? city : '',
    publishingCompany: !_.isEmpty(publishingCompany) ? publishingCompany : '',
    sourceType: !_.isEmpty(sourceType) ? sourceType : '',
    url: !_.isEmpty(url) ? url : '',
    files: !_.isEmpty(files) ? files : '',
    entries: !_.isEmpty(entries) ? entries : [],
    date: !_.isEmpty(date) ? date : '',
    resource,
    user: req.user.id,
  }
  // if source exists update it and exit
  try {
    let source = await Source.findOne({ _id })
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
        { _id },
        { $set: sourceFields },
        { new: true }
      ).then(response => {
        if (!_.isEmpty(authorPost)) {
          authors = !_.isEmpty(authors) ? authors : []
          appendSourceToAuthor({
            authors,
            sourceId: _id.toString(),
          }).then(() => {
            if (!_.isEmpty(entries)) {
              entries = !_.isEmpty(entries) ? entries : []
              // if entry exists append the authorID to both entry and source
              appendEntryToAuthor({
                entries,
                authors,
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
            authors,
            sourceId: post._id.toString(),
          })
        }
      }

      // if entry exists append the authorID to both entry and source
      if (entries) {
        if (entries.length > 0) {
          appendEntryToAuthor({
            entries,
            authors,
          })
        }
      }
      res.json(post)
    }

    return res.status(200)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
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

    return res.json(sources)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
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
    // addAuthorIdToSource(source)

    return res.json(source)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
