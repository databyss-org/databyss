import express from 'express'
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
    const topic = await Block.findOne({
      _id: req.params.id,
    })

    // only allow results that appear on shared page
    if (
      req.publicPages &&
      req.publicPages[0].blocks.filter(b => b._id !== req.params.id).length < 1
    ) {
      return next(new InsufficientPermissionError())
    }

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
    const blocks = await Block.find({
      type: 'TOPIC',
      ...getBlockAccountQueryMixin(req),
    })

    if (!blocks) {
      return res.json([])
    }
    return res.json(blocks)
  })
)

export default router
