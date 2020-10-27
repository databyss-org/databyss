import express from 'express'
import mongoose from 'mongoose'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import {
  ResourceNotFoundError,
  InsufficientPermissionError,
} from '../../lib/Errors'
import { getBlockAccountQueryMixin } from './helpers/accountQueryMixin'

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
      // remove page data and only allow _id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: '$isInPages._id',
        },
      },
    ])

    // only allow results that appear on shared page
    if (
      req.publicPages &&
      req.publicPages[0].blocks.filter(b => b._id !== req.params.id).length < 1
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
    // const blocks = await Block.aggregate([
    //   {
    //     $match: {
    //       type: 'TOPIC',
    //       ...getBlockAccountQueryMixin(req),
    //     },
    //   },
    //   {
    //     // appends all the pages block appears in in an array 'isInPages'
    //     $lookup: {
    //       from: 'pages',
    //       localField: '_id',
    //       foreignField: 'blocks._id',
    //       as: 'isInPages',
    //     },
    //   },
    //   {
    //     $project: {
    //       _id: 1,
    //       text: 1,
    //       account: 1,
    //       type: 1,
    //       // filter out archived pages,
    //       isInPages: {
    //         $filter: {
    //           input: '$isInPages',
    //           as: 'isInPages',
    //           cond: { $eq: ['$$isInPages.archive', false] },
    //         },
    //       },
    //     },
    //   },
    //   // remove page data and only allow _id
    //   {
    //     $project: {
    //       _id: 1,
    //       text: 1,
    //       account: 1,
    //       type: 1,
    //       isInPages: '$isInPages._id',
    //     },
    //   },
    // ])

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
      // remove page data and only allow _id
      {
        $project: {
          _id: 1,
          text: 1,
          account: 1,
          type: 1,
          isInPages: '$isInPages._id',
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
