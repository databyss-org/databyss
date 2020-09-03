import express from 'express'
import { pick } from 'lodash'
import { getAuthorsFromSources } from '@databyss-org/services/lib/util'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import { ResourceNotFoundError } from '../../lib/Errors'
import {
  getBlockAccountQueryMixin,
  getPageAccountQueryMixin,
} from './helpers/accountQueryMixin'
import Page from '../../models/Page'

const router = express.Router()

// @route    POST api/sources
// @desc     Add Source
// @access   Private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res) => {
    const { text, detail, _id } = req.body.data

    const blockFields = {
      account: req.account.id.toString(),
      _id,
      text,
      type: 'SOURCE',
      detail,
    }

    let block = await Block.findOne({ _id })
    if (!block) {
      block = new Block()
    }
    Object.assign(block, blockFields)
    await block.saveWithDetail()
    res.status(200).end()
  })
)

// @route    GET api/sources/authors
// @desc     Get all authors in an account
// @access   Private
router.get(
  '/authors',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, _next) => {
    let blocks = await Block.find({
      type: 'SOURCE',
      ...getBlockAccountQueryMixin(req),
    })

    if (!blocks) {
      return res.json([])
    }

    // add 'isInPage' property which tags if author appears in page
    blocks = await Promise.all(
      blocks.map(async b => {
        let isInPages = []
        const _pages = await Page.find({
          'blocks._id': b._id,
          ...getPageAccountQueryMixin(req),
        })
        if (_pages) {
          isInPages = _pages.map(p => p._id)
        }
        return { ...b._doc, isInPages }
      })
    )

    // group by authors and return array of authors
    const authorsDict = getAuthorsFromSources(blocks)

    return res.json(Object.values(authorsDict))
  })
)

// @route    GET api/sources
// @desc     Get all sources citations in an account
// @access   Private
router.get(
  '/citations',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, _next) => {
    let blocks = await Block.find({
      type: 'SOURCE',
      ...getBlockAccountQueryMixin(req),
    })

    if (!blocks) {
      return res.json([])
    }

    // add 'isInPage' property which tags if author appears in page
    blocks = await Promise.all(
      blocks.map(async b => {
        let isInPages = []
        const _pages = await Page.find({
          'blocks._id': b._id,
          ...getPageAccountQueryMixin(req),
        })
        if (_pages) {
          isInPages = _pages.map(p => p._id)
        }
        return { ...b._doc, isInPages }
      })
    )

    const sourcesCitations = blocks.map(block => {
      const sourcesCitationsDict = pick(block, [
        '_id',
        'text',
        'detail.authors',
        'detail.citations',
        'isInPages',
      ])

      return sourcesCitationsDict
    })

    return res.json(sourcesCitations)
  })
)

// @route    GET api/sources/:id
// @desc     Get source by id
// @access   Private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, next) => {
    const source = await Block.findOne({
      _id: req.params.id,
    })

    if (!source || source.type !== 'SOURCE') {
      return next(new ResourceNotFoundError('There is no source for this id'))
    }

    return res.json(source)
  })
)

// @route    GET api/sources
// @desc     Get all sources in an account
// @access   Private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, _next) => {
    const blocks = await Block.find({
      account: req.account._id,
      type: 'SOURCE',
    })

    if (!blocks) {
      return res.json([])
    }
    return res.json(blocks)
  })
)

export default router
