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

// @route    GET api/sources/authors
// @desc     Get all authors in an account
// @access   Private

router.get(
  '/authors',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, _next) => {
    const blocks = await Block.find({
      account: req.account._id,
      type: 'SOURCE',
    })
    if (!blocks) {
      return res.json([])
    }

    // group by authors and return array of authors
    const authorsDict = blocks.reduce((dict, block) => {
      block.detail.authors.forEach(a => {
        dict[a.firstName.textValue + a.lastName.textValue] = a
      })
      return dict
    }, {})

    return res.json(Object.values(authorsDict))
  })
)

// @route    GET api/sources
// @desc     Get all sources in an account with only author and citation info
// @access   Private
router.get(
  '/sources',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, _next) => {
    const blocks = await Block.find({
      account: req.account._id,
      type: 'SOURCE',
    })
    if (!blocks) {
      return res.json([])
    }

    // group by authors and return array of authors
    const authorsDict = blocks.reduce((dict, block) => {
      block.detail.authors.forEach(a => {
        dict[a.firstName.textValue + a.lastName.textValue] = a
      })
      return dict
    }, {})

    return res.json(Object.values(authorsDict))
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
