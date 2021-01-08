/* eslint-disable no-restricted-syntax, no-await-in-loop */

import express from 'express'
import { uid } from '@databyss-org/data/lib/uid'
import Page from '../../models/Page'
import Block from '../../models/Block'
import Selection from '../../models/Selection'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import {
  pageCreatorMiddleware,
  pageMiddleware,
} from '../../middleware/pageMiddleware'
import { ApiError, BadRequestError } from '../../lib/Errors'
import wrap from '../../lib/guardedAsync'
import { runPatches, getAtomicClosureText } from '../../lib/pages'
import Account from '../../models/Account'

const router = express.Router()

// @route    GET api/page/
// @desc     Get page by ID
// @access   private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res, _next) => {
    const page = req.page
    res.json(page).status(200)
  })
)

// @route    GET api/pages
// @desc     returns all pages associated with account
// @access   private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, next) => {
    // favor shared account first
    if (req.asAccount && req.publicPages) {
      return res.json(req.publicPages).status(200)
    }

    const pageResponse = await Page.find({
      account: req.account._id,
    })

    if (!pageResponse) {
      return next(
        new ApiError('There are no pages associated with this account', 404)
      )
    }
    return res.json(pageResponse).status(200)
  })
)

// @route    GET api/page/
// @desc     Get all pages
// @access   private
router.delete(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res, _next) => {
    req.page.delete()
    res.status(200).end()
  })
)

// @route    PATCH api/page/:id
// @desc     operation on page
// @access   private
router.patch(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res, next) => {
    const { patches } = req.body.data
    if (!patches) {
      return next(new BadRequestError('Missing patch data'))
    }
    for (const patch of patches) {
      await runPatches(patch, req)
    }
    await req.page.save()
    return res.status(200).end()
  })
)

// @route    POST api/pages
// @desc     Adds Page
// @access   private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageCreatorMiddleware],
  wrap(async (req, res, _next) => {
    const { selection, ...pageFields } = req.body.data

    // SAVE SELECTION
    if (selection) {
      let _selection = await Selection.findOne({ _id: selection._id })
      if (_selection) {
        await Selection.findByIdAndUpdate(
          { _id: selection._id },
          { $set: selection }
        )
      } else {
        _selection = new Selection(selection)
        await _selection.save()
      }
    }

    Object.assign(req.page, { ...pageFields, account: req.account._id })
    res.json(await req.page.save()).status(200)
  })
)

// @route    GET api/populate/:id
// @desc     return populated state
// @access   private
router.get(
  '/populate/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC']), pageMiddleware],
  wrap(async (req, res, _next) => {
    const { page } = req
    let selection = null

    // LOAD SELECTION
    if (page.selection._id) {
      selection = await Selection.findOne({
        _id: page.selection._id,
      })
    }
    if (!selection) {
      // initialize new selection
      selection = new Selection({
        anchor: { offset: 0, index: 0 },
        focus: { offset: 0, index: 0 },
      })
      await selection.save()
    }

    // POPULATE BLOCKS
    const blocks = []
    for (const _block of page.blocks) {
      const _rec = await Block.findOne({ _id: _block._id }).select(
        'text.textValue text.ranges type'
      )
      // check for atomic block closure
      if (_block.type?.match(/^END_/)) {
        _rec.text = {
          textValue: getAtomicClosureText(_block.type, _rec.text.textValue),
          ranges: [],
        }
        _rec.type = _block.type
      }
      blocks.push(_rec)
    }

    const response = {
      _id: page._id,
      name: page.name,
      archive: page.archive,
      blocks,
      selection,
      publicAccountId: page.sharedWith?.[0]?.account,
    }

    return res.json(response).status(200)
  })
)

// @route    POST api/pages/:id/public
// @desc     makes a page public or private
// @access   private
router.post(
  '/:id/public',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res, _next) => {
    // create a new account
    const { isPublic, accountId } = req.body.data

    let _sharedAccount
    let sharedWith = []

    if (isPublic) {
      // create a public account
      _sharedAccount = uid()
      const _account = new Account({ _id: _sharedAccount, isPublic: true })
      await _account.save()

      sharedWith = [{ account: _sharedAccount, role: 'VIEW' }]
    } else {
      // remove public account
      await Account.replaceOne(
        {
          _id: accountId,
        },
        { isPublic: false },
        { upsert: true }
      )
    }

    await Page.replaceOne(
      {
        _id: req.page._id,
      },
      {
        ...req.page._doc,
        sharedWith,
      },
      { upsert: true }
    )
    res.json({ accountId: _sharedAccount }).status(200)
  })
)

export default router
