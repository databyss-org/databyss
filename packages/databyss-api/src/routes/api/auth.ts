import express from 'express'
import { cloudant } from '@databyss-org/data/cloudant'
import { Role } from '@databyss-org/data/interfaces'
import { authMiddleware, groupMiddleware } from '../../middleware'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'
import {
  createUserDatabaseCredentials,
  addCredientialsToSession,
} from '../../lib/createUserDatabase'
import {
  activateToken,
  setAccess,
  SetAccessOptions,
  setQuotaAllowed,
} from '../../lib/drive'

const router = express.Router()

// @route    GET api/auth
// @desc     verify user
// @access   Public
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req?.user) {
      let session = await getSessionFromUserId(req.user._id)
      // TODO: on every re-login attempt we are creating new user credentials,
      // should this happen on the back end or should the user save the credentials
      // in their offline database?
      session = await addCredientialsToSession({
        groupId: session.user.defaultGroupId!,
        userId: session.user._id,
        session,
      })

      // use token from cloudant to initialize access on drive
      const _sar = await activateToken(
        { token: session.token, userId: session.user._id },
        true
      )
      console.log('[auth] setAccess', _sar)

      return res.json({ data: { session } })
    }
    return res.json({ data: { isPublic: true } }).status(200)
  } catch (err: any) {
    console.error(err.message)
    return res.status(500).send('Server Error')
    // throw new Error('err')
  }
})

// @route    POST api/auth/drive/:id
// @desc     grant user admin access to drive group, activate token, and set quota allowed
// @access   Private
router.post(
  '/drive/:id',
  [authMiddleware, groupMiddleware([Role.Admin])],
  wrap(async (req, res) => {
    const _opt: SetAccessOptions = {
      accessLevel: 'admin',
      groupId: req.group._id,
      userId: req.user._id,
    }
    await setAccess(_opt, true)
    await activateToken({ userId: _opt.userId!, token: req.token }, true)
    await setQuotaAllowed({ userId: _opt.userId!, allowed: 1000 })
    return res.status(200).json({}).send()
  })
)

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
      const _res = await cloudant.models.Logins.get(_login._id)
      await cloudant.models.Logins.destroy(_res._id, _res._rev)

      if (_login.createdAt >= Date.now() - 36000000) {
        const token = _login.token
        const session = await getSessionFromToken(token)

        // give user credentials, if default db does not exist for user, create one
        const credentials = await createUserDatabaseCredentials(
          session.user,
          skipTitleBlock
        )

        session.groupCredentials = [credentials]

        // use token from cloudant to initialize access on drive
        await activateToken(
          { token: session.token, userId: session.user._id },
          true
        )

        return res.json({ data: { session } })
      }
      return res.status(401).json({ error: 'token expired' })
    }
    return res.status(401).end()
  })
)

export default router
