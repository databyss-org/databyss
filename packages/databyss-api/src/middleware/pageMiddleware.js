// const ApiError = require('./../routes/api/ApiError')
const Page = require('./../models/Page')

const pageMiddleware = async (req, res, next) => {
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

module.exports = pageMiddleware
