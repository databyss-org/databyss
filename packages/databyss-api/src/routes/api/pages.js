/* eslint-disable no-restricted-syntax, no-await-in-loop */

import express from 'express'
import Page from '../../models/Page'
import Selection from '../../models/Selection'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import {
  pageCreatorMiddleware,
  pageMiddleware,
} from '../../middleware/pageMiddleware'
import { ApiError, BadRequestError } from '../../lib/Errors'
import wrap from '../../lib/guardedAsync'
import { runPatches } from './helpers/pagesHelper'

const router = express.Router()

// @route    GET api/page/
// @desc     Get page by ID
// @access   private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res) => {
    const page = req.page
    res.json(page).status(200)
  })
)

// @route    GET api/page
// @desc     returns all pages associated with account
// @access   private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, next) => {
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
  wrap(async (req, res) => {
    req.page.delete()
    res.status(200)
  })
)

// @route    PATCH api/page/:id
// @desc     operation on page
// @access   private
router.patch(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res, next) => {
    const _patches = req.body.data.patch
    if (!_patches) {
      return next(new BadRequestError('missing patch data'))
    }
    // temporary dictionary for entity and block ids
    for (const patch of _patches) {
      await runPatches(patch, req)
    }
    return res.status(200)

    // TODO: response is sent before actions are executed
  })
)

// @route    POST api/pages
// @desc     Adds Page
// @access   private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageCreatorMiddleware],
  wrap(async (req, res) => {
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
  [auth, accountMiddleware(['EDITOR', 'ADMIN']), pageMiddleware],
  wrap(async (req, res) => {
    const { page } = req
    let selection = null

    // load selection
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
    const response = {
      ...page,
      selection,
    }

    return res.json(response).status(200)
  })
)

export default router
