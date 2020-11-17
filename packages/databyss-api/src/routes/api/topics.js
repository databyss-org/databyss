import express from 'express'
import mongoose from 'mongoose'
import { replaceInlineText } from '@databyss-org/editor/state/util'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import {
  ResourceNotFoundError,
  InsufficientPermissionError,
} from '../../lib/Errors'
import {
  getBlockAccountQueryMixin,
  getPageAccountQueryMixin,
} from './helpers/accountQueryMixin'
import BlockRelation from '../../models/BlockRelation'

const router = express.Router()

// @route    POST api/sources
// @desc     Add Source
// @access   Private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res) => {
    const { text, _id } = req.body.data

    const blockFields = {
      account: req.account.id.toString(),
      _id,
      text,
      type: 'TOPIC',
    }

    let block = await Block.findOne({ _id })
    if (!block) {
      block = new Block()
    }
    Object.assign(block, blockFields)
    await block.save()

    /*
      find all inline block relations with associated id and update blocks
    */
    const _relations = await BlockRelation.find({
      relatedBlock: _id,
      account: req.account.id.toString(),
      relationshipType: 'INLINE',
    })

    for (const relation of _relations) {
      // get the block to update
      const _block = await Block.findOne({
        _id: relation.block,
        account: req.account.id.toString(),
      })
      if (_block) {
        // get all inline ranges from block
        const _inlineRanges = _block.text.ranges.filter(
          (r) => r.marks.filter((m) => m.includes('inlineTopic')).length
        )

        _inlineRanges.forEach((r) => {
          // if inline range is matches the ID, update block
          if (r.marks[0].length === 2) {
            const _inlineMark = r.marks[0]
            const _inlineId = _inlineMark[1]
            if (_inlineId === _id) {
              const _newText = replaceInlineText({
                text: _block.text.toJSON(),
                refId: _id,
                newText: block.text,
              })
              Object.assign(_block, { text: _newText })
            }
          }
        })
        if (_inlineRanges.length) {
          // update block
          await _block.save()
          // update relation
          await BlockRelation.replaceOne(
            {
              relatedBlock: _id,
              account: req.account.id.toString(),
              block: _block._id,
            },
            {
              ...relation.toJSON(),
              blockText: _block.text,
            },
            { upsert: true }
          )
        }
      }
    }

    res.status(200).end()
  })
)

// @route    GET api/topic/:id
// @desc     Get topic by id
// @access   Private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, next) => {
    let topic = await Block.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        // lookup  block in block relations and append local property 'isInPages'
        $lookup: {
          from: 'blockrelations',
          localField: '_id',
          foreignField: 'relatedBlock',
          as: 'isInPages',
        },
      },
      // remove block relations data and only allow page id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: '$isInPages.page',
        },
      },
      {
        // gets a list of all pages user is authorized to view
        $lookup: {
          from: 'pages',
          pipeline: [
            {
              $match: {
                ...getPageAccountQueryMixin(req),
              },
            },
          ],
          as: 'authorizedPages',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: 1,
          // filter out archived pages
          authorizedPages: {
            $filter: {
              input: '$authorizedPages',
              as: 'authorizedPages',
              cond: { $eq: ['$$authorizedPages.archive', false] },
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
          isInPages: 1,
          authorizedPages: '$authorizedPages._id',
        },
      },
      // only show pages which appear in the block relations and user is authorized to view
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: { $setIntersection: ['$isInPages', '$authorizedPages'] },
        },
      },
    ])

    // only allow results that appear on shared page
    if (
      req.publicPages &&
      req.publicPages[0]?.blocks.filter((b) => b._id !== req.params.id).length <
        1
    ) {
      return next(new InsufficientPermissionError())
    }

    // aggregate returns an array, this function should only return one value
    topic = topic.length && topic[0]

    if (!topic || topic.type !== 'TOPIC') {
      return next(new ResourceNotFoundError('There is no topic for this id'))
    }

    return res.json(topic)
  })
)

// @route    GET api/topics
// @desc     Get all topics in an account
// @access   Private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, _next) => {
    /*
    aggregate will perform a lookup in block relations and then lookup in the page.blocks,
    the final step will join both these results
    */

    const blocks = await Block.aggregate([
      {
        $match: {
          type: 'TOPIC',
          ...getBlockAccountQueryMixin(req),
        },
      },
      {
        // lookup  block in block relations and append local property 'isInPages'
        $lookup: {
          from: 'blockrelations',
          localField: '_id',
          foreignField: 'relatedBlock',
          as: 'isInPages',
        },
      },
      // remove block relations data and only allow page id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: '$isInPages.page',
        },
      },
      {
        // appends all the pages block appears as a block relation in in an array 'isInPages'
        $lookup: {
          from: 'pages',
          localField: 'isInPages',
          foreignField: '_id',
          as: 'isInPages',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
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
      // look up in pages table
      {
        // appends all the pages block appears in in an array 'appearsInPages'
        $lookup: {
          from: 'pages',
          localField: '_id',
          foreignField: 'blocks._id',
          as: 'appearsInPages',
        },
      },
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: 1,
          // filter out archived pages,
          appearsInPages: {
            $filter: {
              input: '$appearsInPages',
              as: 'appearsInPages',
              cond: { $eq: ['$$appearsInPages.archive', false] },
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
          isInPages: '$isInPages._id',
          appearsInPages: '$appearsInPages._id',
        },
      },
      // join both lookups and remove duplicates
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: { $setUnion: ['$isInPages', '$appearsInPages'] },
        },
      },
    ])

    if (!blocks) {
      return res.json([])
    }

    return res.json(blocks)
  })
)

export default router
