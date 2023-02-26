import express from 'express'
import { cloudant } from '@databyss-org/data/cloudant'
import { authMiddleware } from '../../middleware'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'
import {
  createUserDatabaseCredentials,
  addCredientialsToSession,
} from '../../lib/createUserDatabase'

const router = express.Router()

// @route    GET api/auth
// @desc     verify user
// @access   Public
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req?.user) {
      let session = await getSessionFromUserId(req.user._id)
      // TODO: on every re-login attempt we are creating new user credentials, should this happen on the back end or should the user save the credentials in their offline database?
      session = await addCredientialsToSession({
        groupId: session.user.defaultGroupId!,
        userId: session.user._id,
        session,
      })

      // use token from cloudant to initialize access on drive

      return res.json({ data: { session } })
    }
    return res.json({ data: { isPublic: true } }).status(200)
  } catch (err: any) {
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
    const { code, email, skipTitleBlock } = req.body
    // const login = await cloudant.current.db.use('login')

    const _selector = {
      selector: {
        email: { $eq: email },
        code: { $eq: code },
      },
    }

    const query = await cloudant.models.Logins.find(_selector)

    if (query.docs.length) {
      const _login = query.docs[0]

      if (_login.createdAt >= Date.now() - 36000000) {
        const token = _login.token
        const _res = await cloudant.models.Logins.get(_login._id)
        await cloudant.models.Logins.destroy(_res._id, _res._rev)
        const session = await getSessionFromToken(token)

        // give user credentials, if default db does not exist for user, create one
        const credentials = await createUserDatabaseCredentials(
          session.user,
          skipTitleBlock
        )

        session.groupCredentials = [credentials]

        return res.json({ data: { session } })
      }
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).end()
  })
)

export default router
