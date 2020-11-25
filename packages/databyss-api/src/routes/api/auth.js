import express from 'express'
import auth from '../../middleware/auth'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
import Login from '../../models/Login'
import { cloudant } from './cloudantService'

const router = express.Router()

// @route    GET api/auth
// @desc     verify user
// @access   Public
router.post('/', auth, async (req, res) => {
  try {
    if (req?.user) {
      const session = await getSessionFromUserId(req.user.id)
      return res.json({ data: { session } })
    }
    return res
      .json({ data: { isPublic: true, accountId: req.asAccount } })
      .status(200)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
    // throw new Error('err')
  }
})

// @route    POST api/auth/code
// @desc     verify user with code
// @access   Public
router.post('/code', async (req, res) => {
  try {
    const { code, email } = req.body
    const login = await cloudant.db.use('login')

    const _selector = {
      selector: {
        email: { $eq: email },
        code: { $eq: code },
      },
    }

    const query = await login.find(_selector)
    if (query.docs.length) {
      const _login = query.docs[0]
      // todo: cahnge this back
      if (_login.date >= Date.now() - 36000000) {
        const token = _login.token
        console.log(_login)
        const _res = await login.get(_login._id, _login._rev)

        try {
          await login.destroy(_res._id, _res._rev)
          const session = await getSessionFromToken(token)
          console.log(session)
          return res.json({ data: { session } })
        } catch (err) {
          console.error(err.message)
          res.status(500).send('Server Error')
          throw new Error('err')
        }
      } else {
        res.status(401).json({ error: 'token expired' })
      }
    } else {
      res.status(401).end()
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
    throw new Error('err')
  }
})

export default router
