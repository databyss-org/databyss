const express = require('express')
const mongoose = require('mongoose')
const Entry = require('../../models/Entry')
const ApiError = require('./ApiError')
const Author = require('../../models/Author')
const Source = require('../../models/Source')
const auth = require('../../middleware/auth')
const _ = require('lodash')
const helpers = require('./helpers/entriesHelper')

const router = express.Router()

const {
  appendEntryToSource,
  appendEntryToAuthors,
  appendAuthorToSource,
  // appendEntryToAuthorList,
  //  appendEntriesToSource,
  //  addAuthorId,
  //  addSourceId,
} = helpers

// @route    POST api/entry
// @desc     new Entry
// @access   Private
router.post('/', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    
*/
    let {
      source,
      firstName,
      lastName,
      pageFrom,
      index,
      author,
      pageTo,
      files,
      linkedContent,
      resource,
    } = req.body

    const { entry, _id } = req.body

    // source = _.isString(source) ? source : ''
    resource = _.isString(resource) ? resource : ''
    firstName = _.isString(firstName) ? firstName : ''
    lastName = _.isString(lastName) ? lastName : ''
    pageFrom = _.isNumber(pageFrom) ? pageFrom : ''
    index = _.isString(index) ? index : 0
    author = _.isArray(author) ? author : []
    pageTo = _.isNumber(pageTo) ? pageTo : -1
    files = _.isArray(files) ? files : []
    linkedContent = _.isString(linkedContent) ? linkedContent : ''

    // If new source, create new Id
    if (
      (!_.isEmpty(firstName) || !_.isEmpty(lastName)) &&
      _.isEmpty(resource)
    ) {
      // POST NEW AUTHOR
      let authorPost
      authorPost = new Author({
        firstName,
        lastName,
        user: req.user.id,
      })
      authorPost = await authorPost.save()
      author.push(authorPost._id.toString())
    }

    if (!_.isEmpty(resource)) {
      let sourcePost
      let authorId
      if (!_.isEmpty(firstName) || !_.isEmpty(lastName)) {
        let authorPost
        // create new author
        authorPost = new Author({
          firstName,
          lastName,
          user: req.user.id,
        })
        authorPost = await authorPost.save()
        authorId = authorPost._id.toString()
        author.push(authorId)

        // create new souce
        const newSource = new Source({
          resource,
          user: req.user.id,
          authors: author,
        })
        sourcePost = await newSource.save()
        source = sourcePost._id.toString()

        // Update author with new source id
        authorPost = await Author.findOne({ _id: authorId })
        authorPost.sources = authorPost.sources.concat(source)
        authorPost = await Author.findOneAndUpdate(
          { _id: authorId },
          { $set: authorPost },
          { new: true }
        )
      } else {
        // create new source with or without existing author
        const newSource = new Source({
          resource,
          authors: !_.isEmpty(author) ? author : [],
          user: req.user.id,
        })
        sourcePost = await newSource.save()
        source = sourcePost._id.toString()

        // check to see if author exists
        if (_.isArray(author)) {
          appendAuthorToSource({ authors: author, sourceId: source })
        }
      }
    }

    const entryFields = {
      pageFrom,
      source,
      author,
      pageTo,
      files,
      entry,
      index,
      linkedContent,
      user: req.user.id,
    }

    // CHECK HERE IF ENTRY EXISTS
    const entryExists = await Entry.findOne({ _id })
    if (entryExists) {
      if (req.user.id.toString() !== entryExists.user.toString()) {
        throw new ApiError('This post is private', 401)

        //  return res.status(401).json({ msg: 'This post is private' })
      }

      // update entry
      entryFields._id = _id
      Entry.findOneAndUpdate({ _id }, { $set: entryFields }).then(
        async entryPost => {
          // if source exists, append entry to source
          if (!_.isEmpty(source)) {
            await appendEntryToSource({
              sourceId: source,
              entryId: entryPost._id,
            })
          }
          // if author exists, append entry to author
          if (!_.isEmpty(author)) {
            await appendEntryToAuthors({
              authors: author,
              entryId: entryPost._id,
            })
          }
          return res.json(entryPost)
        }
      )
    }

    // create new entry
    const newId = !_.isEmpty(_id)
      ? new mongoose.mongo.ObjectId(_id)
      : new mongoose.mongo.ObjectId()
    const entries = new Entry({ ...entryFields, _id: newId })
    const post = await entries.save()

    // if source exists, append entry to source
    if (!_.isEmpty(source)) {
      await appendEntryToSource({ sourceId: source, entryId: post._id })
    }
    // if author exists, append entry to author
    if (!_.isEmpty(author)) {
      await appendEntryToAuthors({ authors: author, entryId: post._id })
    }
    return res.json(post)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

// @route    GET api/entry/:id
// @desc     Get entry by ID
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
    const entry = await Entry.findOne({
      _id: req.params.id,
    })
      .populate('source', 'resource')
      .populate('author', 'firstName lastName')

    if (!entry) {
      throw new ApiError('There is no entry for this id', 400)

      // return res.status(400).json({ msg: 'There is no entry for this id' })
    }

    if (!entry.default) {
      if (req.user.id.toString() !== entry.user.toString()) {
        throw new ApiError('This post is private', 401)

        //  return res.status(401).json({ msg: 'This post is private' })
      }
    }

    return res.json(entry)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})
// @route    GET api/entries/
// @desc     Get all entries
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const entry = await Entry.find()
      .or([{ user: req.user.id }, { default: true }])
      .populate('source', 'resource')
      .populate('author', 'firstName lastName')
      .limit(10)

    // const entry = await Entry.find({ user: req.user.id })
    if (!entry) {
      throw new ApiError('There are no entries', 400)

      //   return res.status(400).json({ msg: 'There are no entries' })
    }

    // to migrate run command in order, one at a time
    // only run each function once
    // appendEntryToAuthorList(entry)
    // appendEntriesToSource(entry)
    // addAuthorId(entry)
    // addSourceId(entry)

    return res.json(entry)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
