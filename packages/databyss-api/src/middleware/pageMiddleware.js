import mongoose from 'mongoose'
import Page from './../models/Page'
import {
  ResourceNotFoundError,
  UnauthorizedError,
  InsufficientPermissionError,
} from '../lib/Errors'
import wrap from '../lib/guardedAsync'

export const pageCreatorMiddleware = wrap(async (req, _res, next) => {
  const { _id } = req.body.data
  let page = await Page.findOne({ _id })

  if (!page) {
    page = new Page({
      _id,
      account: req.account._id,
    })
  }
  if (req.account._id.toString() !== page.account.toString()) {
    return next(new UnauthorizedError('You do not have access to this page.'))
  }
  req.page = page
  return next()
})

export const pageMiddleware = wrap(async (req, _res, next) => {
  const _id = req.params.id
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return next(new ResourceNotFoundError('Invalid Page ID'))
  }
  const page = await Page.findOne({
    _id,
  })

  if (!page) {
    return next(new ResourceNotFoundError('There is no page for this ID'))
  }

  // check if page is the same page if on public account
  if (
    req.asAccount &&
    page?.sharedWith.find(
      s => s.account.toString() === req?.asAccount.toString()
    )
  ) {
    page.readOnly = true
  } else if (!(req?.account?._id.toString() === page.account.toString())) {
    return next(new InsufficientPermissionError())
  }

  req.page = page

  return next()
})
