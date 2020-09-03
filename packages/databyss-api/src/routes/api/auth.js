import express from 'express'
import auth from '../../middleware/auth'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
import Login from '../../models/Login'

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
    const query = Login.findOne({ email, code })
    query.exec((err, login) => {
      if (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
        throw new Error('err')
      }

      if (login) {
        // todo: cahnge this back
        if (login.date.getTime() >= Date.now() - 36000000) {
          const token = login.token
          const deleteQuery = Login.findOneAndRemove({ code })
          deleteQuery.exec(async err => {
            if (err) {
              console.error(err.message)
              res.status(500).send('Server Error')
              throw new Error('err')
            }
            const session = await getSessionFromToken(token)
            return res.json({ data: { session } })
          })
        } else {
          res.status(401).json({ error: 'token expired' })
        }
      } else {
        res.status(401).end()
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
    throw new Error('err')
  }
})

export default router
