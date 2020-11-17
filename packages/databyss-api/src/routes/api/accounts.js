import express from 'express'
import auth from '../../middleware/auth'
import Account from '../../models/Account'
import { ApiError } from '../../lib/Errors'
import accountMiddleware from '../../middleware/accountMiddleware'

const router = express.Router()

// @route POST api/accounts/
// @desc  create
router.post('/', auth, async (req, res) => {
  try {
    const users = [
      {
        _id: req.user.id,
        role: 'ADMIN',
      },
    ]
    const account = new Account({ users })
    await account.save()

    return res.json(account)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route POST api/accounts/page/:id
// @desc  set new default page
router.post(
  '/page/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const account = await Account.findOne({ _id: req.account.id })

      account.defaultPage = req.params.id

      await Account.findOneAndUpdate(
        { _id: req.account.id },
        { $set: account },
        { new: true }
      )
      return res.status(200).send()
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route GET api/accounts/
// @desc  get account info
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const account = await Account.findOne({ _id: req.account._id })
      return res.json(account)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    POST api/accounts/:id
// @desc     add user id to account
// @access   private
router.post(
  '/user/:id',
  [auth, accountMiddleware(['ADMIN'])],
  async (req, res) => {
    try {
      const _id = req.account._id
      const userId = req.params.id
      const role = req.body.role

      const users = req.account.users

      // const index = users.indexOf(userId)
      const accountUser = users.find(
        (user) => user._id.toString() === userId.toString()
      )

      const accountFields = {
        _id,
        users,
      }

      if (accountUser) {
        // UPDATE USER PERMISSION
        const index = users.findIndex(
          (user) => user._id.toString() === userId.toString()
        )
        users[index].role = role
      } else {
        users.push({ _id: userId, role })
      }

      const accountData = await Account.findOneAndUpdate(
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
  }
)

// @route    DELETE api/accounts/
// @desc     Deletes user id from account
// @access   private
router.delete(
  '/:id',
  [auth, accountMiddleware(['ADMIN'])],
  async (req, res) => {
    try {
      const _id = req.account._id
      const userId = req.params.id

      const users = req.account.users

      const index = users.findIndex(
        (user) => user._id.toString() === userId.toString()
      )

      if (index < 0) {
        return res
          .status(200)
          .json({ msg: 'user not associated with this account' })
      }

      users.splice(index, 1)

      Account.findOneAndUpdate({ _id }, { $set: users }, { new: true })

      return res.status(200).json({ msg: 'user has been deleted' })
    } catch (err) {
      console.log(err)
      if (err instanceof ApiError) {
        return res.status(err.status).json({ message: err.message })
      }
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
