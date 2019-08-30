const express = require('express')
const Page = require('../../models/Page')
const Source = require('../../models/Source')
const Entry = require('../../models/Entry')
const Block = require('../../models/Block')
const auth = require('../../middleware/auth')
const accountMiddleware = require('../../middleware/accountMiddleware')
const pageMiddleware = require('../../middleware/pageMiddleware')
const ApiError = require('./ApiError')
const {
  getBlockItemsFromId,
  dictionaryFromList,
  getSourcesFromId,
  getEntriesFromId,
} = require('./helpers/pagesHelper')

const router = express.Router()

// @route    POST api/pages
// @desc     Adds Page
// @access   private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  async (req, res) => {
    try {
      const { sources, entries, blocks, page } = req.body.data
      const { name, _id } = page

      // ADD SOURCES
      const _sources = Object.keys(sources)

      _sources.forEach(async s => {
        const source = sources[s].rawHtml
        const sourceId = sources[s]._id

        // SOURCE WITH ID
        const sourceFields = {
          resource: source,
          _id: sourceId,
          user: req.user.id,
          account: req.account._id,
        }

        // IF SOURCE EXISTS EDIT SOURCE
        let sourceResponse = await Source.findOne({ _id: sourceId })

        if (sourceResponse) {
          sourceResponse = await Source.findOneAndUpdate(
            { _id: sourceId },
            { $set: sourceFields }
          )
        } else {
          // ADD NEW SOURCE
          sourceResponse = new Source(sourceFields)
          await sourceResponse.save()
        }
      })

      // ADD ENTRIES
      const _entries = Object.keys(entries)

      _entries.forEach(async e => {
        const entry = entries[e].rawHtml
        const entryId = entries[e]._id
        // ENTRY WITH ID
        const entryFields = {
          entry,
          _id: entryId,
          user: req.user.id,
          account: req.account._id,
        }

        let entryResponse = await Entry.findOne({ _id: entryId })
        if (entryResponse) {
          entryResponse = await Entry.findOneAndUpdate(
            { _id: entryId },
            { $set: entryFields }
          )
        } else {
          // ADD NEW ENTRY
          entryResponse = new Entry(entryFields)
          await entryResponse.save()
        }
      })

      // ADD BLOCK
      const _blocks = Object.keys(blocks).map(b => blocks[b])
      _blocks.forEach(async block => {
        const { _id, type, refId } = block
        const blockFields = {
          type,
          _id,
          user: req.user.id,
          account: req.account._id,
        }
        if (type === 'SOURCE') {
          blockFields.sourceId = refId
        }
        if (type === 'ENTRY') {
          blockFields.entryId = refId
        }
        if (type === 'Author') {
          blockFields.authorId = refId
        }
        let blockResponse = await Block.findOne({ _id })
        // if block exists, edit block
        if (blockResponse) {
          if (req.account._id.toString() !== blockResponse.account.toString()) {
            throw new ApiError('This block is private', 401)
          }

          blockResponse = await Block.findOneAndUpdate(
            { _id },
            { $set: blockFields }
          )
        } else {
          // create new block
          blockResponse = new Block(blockFields)
          await blockResponse.save()
        }
      })

      const pageBlocks = page.blocks

      const pageFields = {
        name,
        blocks: pageBlocks,
        account: req.account._id,
      }

      const pageResponse = await Page.findOneAndUpdate(
        { _id },
        { $set: pageFields },
        { new: true }
      )

      return res.json(pageResponse)
    } catch (err) {
      if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message })
      }
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

// @route    GET api/page/
// @desc     Get page by ID
// @access   private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const page = await Page.findOne({
        _id: req.params.id,
      })

      if (!page) {
        return res.status(400).json({ msg: 'There is no page for this id' })
      }

      return res.json(page)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/populate/:id
// @desc     return populated state
// @access   private
router.get(
  '/populate/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const pageResponse = await Page.findOne({
        _id: req.params.id,
      })

      if (!pageResponse) {
        return res.status(400).json({ msg: 'There is no page for this id' })
      }

      const page = {
        _id: pageResponse._id,
        name: pageResponse.name,
        blocks: pageResponse.blocks,
      }

      const blockList = await getBlockItemsFromId(pageResponse.blocks)
      const blocks = dictionaryFromList(blockList)
      const sourceList = blockList.filter(b => b.type === 'SOURCE')
      let sources = await getSourcesFromId(sourceList)
      sources = dictionaryFromList(sources)
      const entriesList = blockList.filter(b => b.type === 'ENTRY')
      let entries = await getEntriesFromId(entriesList)
      entries = dictionaryFromList(entries)

      const response = {
        page,
        blocks,
        entries,
        sources,
      }

      return res.json(response)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/page/
// @desc     Get all pages
// @access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const page = await Page.find({ user: req.user.id })
    if (!page) {
      return res.status(400).json({ msg: 'There are no pages' })
    }

    return res.json(page)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
