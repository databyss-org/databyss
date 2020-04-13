import mongoose from 'mongoose'
import Page from './../models/Page'

export const pageCreatorMiddleware = async (req, res, next) => {
  const { _id } = req.body.data.page
  let pageResponse = await Page.findOne({ _id })

  if (pageResponse) {
    if (req.account._id.toString() !== pageResponse.account.toString()) {
      return res.status(401).json({ msg: 'authorization denied' })
      // throw new ApiError('This page is private', 401)
    }
  } else {
    pageResponse = new Page({
      _id,
      account: req.account._id,
    })
    await pageResponse.save()
  }

  req.page = pageResponse
  return next()
}

export const pageMiddleware = async (req, res, next) => {
  const _id = req.params.id

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ msg: 'id not valid' })
  }

  const page = await Page.findOne({
    _id,
  })

  if (!page) {
    return res.status(400).json({ msg: 'There is no page for this id' })
  }

  req.page = page

  return next()
}
