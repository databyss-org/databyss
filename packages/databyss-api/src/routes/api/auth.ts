import express from 'express'
import auth from '../../middleware/auth'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
//import Login from '../../models/Login'
import wrap from '../../lib/guardedAsync'
import { Logins } from '@databyss-org/data/serverdbs'
import {
  createUserDatabaseCredentials,
  addCredentialsToUser,
} from '../../lib/createUserDatabase'

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
router.post(
  '/code',
  wrap(async (req, res) => {
    const { code, email } = req.body
    // const login = await cloudant.db.use('login')

    const _selector = {
      selector: {
        email: { $eq: email },
        code: { $eq: code },
      },
    }

    const query = await Logins.find(_selector)

    if (query.docs.length) {
      const _login = query.docs[0]

      // todo: change this back
      if (_login.createdAt >= Date.now() - 36000000) {
        const token = _login.token
        const _res = await Logins.get(_login._id, _login._rev)
        await Logins.destroy(_res._id, _res._rev)
        const session = await getSessionFromToken(token)
        // check if user has login credentials
        if (!session.user.defaultGroupId) {
          // if default group doesnt exist, initiate a new database and pass the data back to the client
          const credentials = await createUserDatabaseCredentials(session.user)
          const _user = await addCredentialsToUser(
            session.user._id,
            credentials
          )
          // add credential to users `groups` property

          session.user.groups = [
            {
              ..._user.groups[0],
              dbKey: credentials.dbKey,
              dbPassword: credentials.dbPassword,
            },
          ]
        }

        // console.log(session)
        return res.json({ data: { session } })
      }
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).end()
  })
)

export default router
