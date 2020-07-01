import express from 'express'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import { ResourceNotFoundError } from '../../lib/Errors'

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

// @route    GET api/sources/:id
// @desc     Get all sources in an account
// @access   Private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, _next) => {
    const blocks = await Block.find({ account: req.account._id })

    if (!blocks) {
      return res.json([])
    }
    return res.json(blocks)
  })
)

export default router
