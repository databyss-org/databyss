import express from 'express'
import _ from 'lodash'
import Page from '../../models/Page'
import Source from '../../models/Source'
import Entry from '../../models/Entry'
import Block from '../../models/Block'
import Topic from '../../models/Topic'
import Location from '../../models/Location'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import pageMiddleware from '../../middleware/pageMiddleware'
import ApiError from '../../lib/ApiError'
import {
  getBlockItemsFromId,
  dictionaryFromList,
  populateRefEntities,
} from './helpers/pagesHelper'

const router = express.Router()

// @route    POST api/pages
// @desc     Adds Page
// @access   private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  async (req, res) => {
    try {
      const { blocks, page } = req.body.data
      let { sources, entries, topics, locations } = req.body.data

      sources = !_.isEmpty(sources) ? sources : {}
      topics = !_.isEmpty(topics) ? topics : {}
      entries = !_.isEmpty(entries) ? entries : {}
      locations = !_.isEmpty(locations) ? locations : {}

      const { name, _id } = page

      // ADD SOURCES
      if (!_.isEmpty(sources)) {
        const _sources = Object.keys(sources)
        await Promise.all(
          _sources.map(async s => {
            const source = sources[s].textValue
            const sourceId = s
            const ranges = !_.isEmpty(sources[s].ranges)
              ? sources[s].ranges
              : []

            // SOURCE WITH ID
            const sourceFields = {
              text: { textValue: source, ranges },
              _id: sourceId,
              ranges,
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
        )
      }

      // ADD ENTRIES

      if (!_.isEmpty(entries)) {
        const _entries = Object.keys(entries)

        await Promise.all(
          _entries.map(async e => {
            const text = entries[e].textValue
            const entryId = e
            const ranges = !_.isEmpty(entries[e].ranges)
              ? entries[e].ranges
              : []
            // ENTRY WITH ID
            const entryFields = {
              text: { textValue: text, ranges },
              _id: entryId,
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
        )
      }

      // ADD TOPICS
      if (!_.isEmpty(topics)) {
        const _topics = Object.keys(topics)

        await Promise.all(
          _topics.map(async e => {
            const topic = topics[e].textValue
            const topicId = e
            const ranges = !_.isEmpty(topics[e].ranges) ? topics[e].ranges : []

            // TOPIC WITH ID
            const topicFields = {
              text: { textValue: topic, ranges },

              //  text: topic,
              ranges,
              _id: topicId,
              account: req.account._id,
            }

            let topicResponse = await Topic.findOne({ _id: topicId })
            if (topicResponse) {
              topicResponse = await Topic.findOneAndUpdate(
                { _id: topicId },
                { $set: topicFields }
              )
            } else {
              // ADD NEW TOPIC
              topicResponse = new Topic(topicFields)
              await topicResponse.save()
            }
          })
        )
      }

      // ADD LOCATION
      if (!_.isEmpty(locations)) {
        const _locations = Object.keys(locations)

        await Promise.all(
          _locations.map(async e => {
            const location = locations[e].text
            const locationId = locations[e]._id
            const ranges = !_.isEmpty(locations[e].ranges)
              ? locations[e].ranges
              : []

            // LOCATION WITH ID
            const locationFields = {
              text: location,
              ranges,
              _id: locationId,
              account: req.account._id,
            }

            let locationResponse = await Location.findOne({ _id: locationId })
            if (locationResponse) {
              locationResponse = await Location.findOneAndUpdate(
                { _id: locationId },
                { $set: locationFields }
              )
            } else {
              // ADD NEW LOCATION
              locationResponse = new Location(locationFields)
              await locationResponse.save()
            }
          })
        )
      }

      // ADD BLOCK
      if (!_.isEmpty(blocks)) {
        const _blocks = Object.keys(blocks).map(b => blocks[b])
        await Promise.all(
          _blocks.map(async block => {
            const { _id, type, refId } = block

            const idType = {
              ENTRY: { entryId: refId },
              SOURCE: { sourceId: refId },
              TOPIC: { topicId: refId },
              AUTHOR: { authorId: refId },
              LOCATION: { locationId: refId },
            }[type]

            const blockFields = {
              type,
              _id,
              user: req.user.id,
              account: req.account._id,
              ...idType,
            }

            let blockResponse = await Block.findOne({ _id })
            // if block exists, edit block
            if (blockResponse) {
              if (
                req.account._id.toString() !== blockResponse.account.toString()
              ) {
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
        )
      }
      const pageBlocks = page.blocks

      // if name is passed, save name
      const pageFields = {
        ...(name && { name }),
        ...(pageBlocks && { blocks: pageBlocks }),
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

      const [sources, entries, topics, locations] = await Promise.all(
        ['SOURCE', 'ENTRY', 'TOPIC', 'LOCATION'].map(async t => {
          const list = blockList.filter(b => b.type === t)
          const populated = await populateRefEntities(list, t)
          return dictionaryFromList(populated)
        })
      )

      const response = {
        page,
        blocks,
        entries,
        sources,
        locations,
        topics,
      }

      return res.json(response)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/page
// @desc     returns all pages associated with account
// @access   private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const pageResponse = await Page.find({ account: req.account._id })

      if (!pageResponse) {
        return res
          .status(400)
          .json({ msg: 'There are no pages associated with this account' })
      }
      return res.json(pageResponse)
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

export default router
