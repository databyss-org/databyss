const express = require('express')
const auth = require('../../middleware/auth')
const Account = require('../../models/Account')
const ApiError = require('../../lib/ApiError')

const router = express.Router()

// @route POST api/accounts/
// @desc  create
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id
    const account = new Account({ users: [userId] })
    await account.save()

    return res.json(account)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    POST api/accounts/:id
// @desc     add user id to account
// @access   private
router.post('/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id
    const userId = req.body.user
    let accountData = await Account.findOne({ _id })
    if (!accountData) {
      throw new ApiError('no account associated with this id', 400)
    }

    const users = accountData.users

    if (users.indexOf(req.user.id)) {
      throw new ApiError('not authorized to access account', 401)
    }

    const index = users.indexOf(userId)
    if (index > -1) {
      return res
        .status(200)
        .json({ msg: 'user already associated with this account' })
    }
    users.push(userId)
    const accountFields = {
      _id,
      users,
    }
    accountData = await Account.findOneAndUpdate(
      { _id },
      { $set: accountFields },
      { new: true }
    )
    return res.json(accountData)
  } catch (err) {
    /*
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    */
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    DELETE api/accounts/
// @desc     Deletes user id from account
// @access   private
router.delete('/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id
    const userId = req.body.user
    let accountData = Account.findOne({ _id })

    if (!accountData) {
      throw new ApiError('no account associated with this id', 400)
    }

    const users = accountData.users
    if (users.findIndex(req.user.id) < 0) {
      throw new ApiError('not authorized to access account', 401)
    }

    const index = users.findIndex(userId)
    if (index < 0) {
      return res
        .status(200)
        .json({ msg: 'user not associated with this account' })
    }
    users.splice(index, 1)
    accountData = Account.findOneAndUpdate(
      { _id },
      { $set: users },
      { new: true }
    )
    accountData.save()
    return res.status(200).json({ msg: 'user has been added' })
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
