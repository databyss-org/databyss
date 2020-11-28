import express from 'express'
import { pick } from 'lodash'

import {
  asyncForEach,
  getAuthorsFromSources,
} from '@databyss-org/services/lib/util'
import { toCitation } from '@databyss-org/services/citations'

import { ResourceNotFoundError } from '../../lib/Errors'
import accountMiddleware from '../../middleware/accountMiddleware'
import auth from '../../middleware/auth'
import Block from '../../models/Block'
import Page from '../../models/Page'
import wrap from '../../lib/guardedAsync'

import {
  getPageAccountQueryMixin,
  getBlockAccountQueryMixin,
} from './helpers/accountQueryMixin'

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
    const blocks = await Block.aggregate([
      {
        $match: {
          type: 'SOURCE',
          ...getBlockAccountQueryMixin(req),
        },
      },
      {
        // appends all the pages block appears in in an array 'isInPages'
        $lookup: {
          from: 'pages',
          localField: '_id',
          foreignField: 'blocks._id',
          as: 'isInPages',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          type: 1,
          account: 1,
          detail: 1,
          // filter out archived pages,
          isInPages: {
            $filter: {
              input: '$isInPages',
              as: 'isInPages',
              cond: { $eq: ['$$isInPages.archive', false] },
            },
          },
        },
      },
      // remove page data and only allow _id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          detail: 1,
          isInPages: '$isInPages._id',
        },
      },
    ])

    if (!blocks) {
      return res.json([])
    }

    // group by authors and return array of authors
    const authorsDict = getAuthorsFromSources(blocks)

    return res.json(Object.values(authorsDict))
  })
)

// @route    GET api/sources
// @desc     Get all sources citations in an account
// @access   Private
router.get(
  '/citations/:citationStyleId',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, _next) => {
    const blocks = await Block.aggregate([
      {
        $match: {
          type: 'SOURCE',
          ...getBlockAccountQueryMixin(req),
        },
      },
      {
        // appends all the pages block appears in in an array 'isInPages'
        $lookup: {
          from: 'pages',
          localField: '_id',
          foreignField: 'blocks._id',
          as: 'isInPages',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          detail: 1,
          // filter out archived pages,
          isInPages: {
            $filter: {
              input: '$isInPages',
              as: 'isInPages',
              cond: { $eq: ['$$isInPages.archive', false] },
            },
          },
        },
      },
      // remove page data and only allow _id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          detail: 1,
          isInPages: '$isInPages._id',
        },
      },
    ])

    if (!blocks) {
      return res.json([])
    }

    // build responses
    const sourcesCitations = blocks.map((block) => {
      const sourcesCitationsDict = pick(block, [
        '_id',
        'text',
        'type',
        'detail',
        'detail.authors',
        'detail.citations',
        'isInPages',
      ])
      sourcesCitationsDict.citation = ''

      return sourcesCitationsDict
    })

    // add formatted citation to each entry
    const { citationStyleId } = req.params
    await asyncForEach(sourcesCitations, async (s) => {
      const { detail } = s
      if (detail) {
        s.citation = await toCitation(s.detail, { styleId: citationStyleId })
      }
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

    // populates current pages
    let isInPages = []
    const _pages = await Page.find({
      'blocks._id': source._id,
      ...getPageAccountQueryMixin(req),
    })
    if (_pages) {
      isInPages = _pages.map((p) => p._id)
    }

    return res.json({ ...source._doc, isInPages })
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
