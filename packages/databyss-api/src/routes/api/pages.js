import express from 'express'
import _ from 'lodash'
import Page from '../../models/Page'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import {
  pageCreatorMiddleware,
  pageMiddleware,
} from '../../middleware/pageMiddleware'
import ApiError from '../../lib/ApiError'
import {
  getBlockItemsFromId,
  dictionaryFromList,
  populateRefEntities,
  composeBlockList,
  modelDict,
} from './helpers/pagesHelper'

const router = express.Router()

// @route    GET api/page/
// @desc     Get page by ID
// @access   private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  async (req, res) => {
    try {
      const page = req.page

      return res.json(page)
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
      const pageResponse = await Page.find({
        account: req.account._id,
      })

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
    const page = await Page.deleteOne({ _id: req.params.id })
    if (!page) {
      return res.status(404).json({ msg: 'There are no pages' })
    }

    return res.status(200)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    PATCH api/page/:id
// @desc     operation on page
// @access   private
router.patch(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  async (req, res) => {
    try {
      const _patches = req.body.data.patch
      if (_patches) {
        const _cache = {}
        await Promise.all(
          _patches.map(async p => {
            const _prop = p.path[0]
            switch (p.op) {
              case 'replace': {
                console.log('in replace')
                // replace in entity
                if (_prop === 'entityCache') {
                  await modelDict(p.value.type).findOneAndUpdate(
                    { _id: p.path[1] },
                    {
                      text: {
                        textValue: p.value.textValue,
                        ranges: p.value.ranges,
                      },
                    }
                  )
                }
                return
              }

              case 'add': {
                switch (_prop) {
                  case 'blocks': {
                    console.log('in blocks')
                    const _index = p.path[1]
                    // insert block id into page
                    const _page = await Page.findOne({ _id: req.page._id })
                    const blocks = _page.blocks
                    blocks.splice(_index, 0, { _id: p.value._id })
                    await Page.findOneAndUpdate(
                      { _id: req.page._id },
                      { blocks }
                    )
                    return
                  }
                  case 'blockCache': {
                    console.log('in blockCache')
                    const _type = p.value.type
                    const _entityId = p.value.entityId
                    const _blockId = p.path[1]

                    // add entity id to temporary cache
                    _cache[_entityId] = _blockId

                    const idType = {
                      ENTRY: { entryId: _entityId },
                      SOURCE: { sourceId: _entityId },
                      TOPIC: { topicId: _entityId },
                      AUTHOR: { authorId: _entityId },
                      LOCATION: { locationId: _entityId },
                    }[_type]

                    const blockFields = {
                      type: _type,
                      _id: _blockId,
                      user: req.user.id,
                      account: req.account._id,
                      ...idType,
                    }

                    const _block = new Block(blockFields)
                    await _block.save()
                    return
                  }
                  case 'entityCache': {
                    console.log('in entity')
                    const entityFields = {
                      text: p.value.text,
                      _id: p.value._id,
                      page: req.page._id,
                      ...(_cache[p.value._id] && {
                        block: _cache[p.value._id],
                      }),
                      account: req.account._id,
                    }

                    const _entity = new modelDict(p.value.type)(entityFields)
                    await _entity.save()
                    return
                  }
                  default:
                    return
                }
              }
              // todo case delete
              default:
                return
            }
          })
        )
      }

      return res.json({ msg: 'success' })
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    POST api/pages
// @desc     Adds Page
// @access   private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageCreatorMiddleware],
  async (req, res) => {
    try {
      // TODO: SAVE SELECTION
      const { blocks, page, blockCache, entityCache } = req.body.data

      const { name, _id, archive } = page

      // SAVE ENTITIES
      const _fields = ['ENTRY', 'SOURCE', 'TOPIC', 'LOCATION']

      await Promise.all(
        _fields.map(async entity => {
          // filter entityCache by type
          const _entities = _.pickBy(entityCache, v => v.type === entity)
          if (!_.isEmpty(_entities)) {
            // save entities
            return Promise.all(
              Object.values(_entities).map(async e => {
                const _entityId = e._id
                const text = e.text
                // retrieve the blockID from block cache
                const _blockId = Object.keys(
                  _.pickBy(blockCache, b => b.entityId === _entityId)
                )[0]

                const entityFields = {
                  text,
                  _id: _entityId,
                  page: _id,
                  block: _blockId,
                  account: req.account._id,
                }

                let _entity = await modelDict(entity).findOne({
                  _id: _entityId,
                })

                if (_entity) {
                  // SAVE ENTITY
                  _entity = await modelDict(entity).findOneAndUpdate(
                    { _id: _entityId },
                    { $set: entityFields }
                  )
                  return _entity
                }
                // ADD NEW ENTITY
                /* eslint new-cap: 1 */
                _entity = new modelDict(entity)(entityFields)
                await _entity.save()

                return _entity
              })
            )
          }
          return null
        })
      )

      // SAVE BLOCK FIELDS
      if (!_.isEmpty(blockCache)) {
        // created populated array
        const _blocks = Object.keys(blockCache).map(b => ({
          ...blockCache[b],
          _id: b,
        }))

        await Promise.all(
          _blocks.map(async block => {
            const { _id, type, entityId } = block

            const idType = {
              ENTRY: { entryId: entityId },
              SOURCE: { sourceId: entityId },
              TOPIC: { topicId: entityId },
              AUTHOR: { authorId: entityId },
              LOCATION: { locationId: entityId },
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

      // SAVE PAGE FIELDS

      const pageFields = {
        ...(name && { name }),
        ...(blocks && { blocks }),
        ...(archive && { archive: true }),
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

// @route    GET api/populate/:id
// @desc     return populated state
// @access   private
router.get(
  '/populate/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  async (req, res) => {
    try {
      const pageResponse = req.page
      const page = {
        _id: pageResponse._id,
        name: pageResponse.name,
        blocks: pageResponse.blocks,
      }

      const blockList = await getBlockItemsFromId(pageResponse.blocks)

      let blocks = []
      await Promise.all(
        ['SOURCE', 'ENTRY', 'TOPIC', 'LOCATION'].map(async t => {
          const list = blockList.filter(b => b.type === t)
          const populated = await populateRefEntities(list, t)
          return populated.forEach(b => blocks.push(b))
        })
      )
      // convert block list to list of key value pairs
      blocks = blocks.map(b => dictionaryFromList([b]))

      const entityCache = {}
      blocks.forEach(b => {
        if (!_.isEmpty(b)) {
          const _entityData = Object.values(b)[0]
          const { type, _id } = _entityData
          const text = {
            textValue: _entityData.textValue,
            ranges: _entityData.ranges,
          }

          entityCache[Object.keys(b)[0]] = { type, _id, text }
        }
      })

      // TODO: SAVE SELECTION
      const selection = {
        anchor: { index: 0, offset: 0 },
        focus: { index: 0, offset: 0 },
      }

      const response = {
        page: { _id: page._id, name: page.name },
        blocks: page.blocks,
        blockCache: composeBlockList(blockList),
        entityCache,
        selection,
      }

      return res.json(response)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
