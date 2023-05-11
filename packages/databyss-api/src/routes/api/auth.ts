import express from 'express'
import { check } from 'express-validator/check'
import { cloudant } from '@databyss-org/data/cloudant'
import { Role } from '@databyss-org/data/interfaces'
import { authMiddleware, groupMiddleware } from '../../middleware'
import { getSessionFromToken, getSessionFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'
import {
  createUserDatabaseCredentials,
  addCredientialsToSession,
} from '../../lib/createUserDatabase'
import { activateToken, setAccess, SetAccessOptions } from '../../lib/drive'

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
// @desc     authorize group access to drive
// @access   Private
router.post(
  '/drive/:id',
  [
    authMiddleware,
    groupMiddleware([Role.Admin]),
    check('accessLevel', 'invalid or missing accessLevel').isIn([
      'admin',
      'readwrite',
      'readonly',
    ]),
    check('userId', 'userId required if isPublic is false').custom(
      (value, { req }) => !!value || req.body.isPublic
    ),
  ],
  wrap(async (req, res) => {
    const _opt: SetAccessOptions = {
      accessLevel: req.body.accessLevel,
      groupId: req.group._id,
    }
    if (req.body.isPublic) {
      _opt.isPublic = true
    } else {
      _opt.userId = req.body.userId
    }
    const _sar = await setAccess(_opt, true)
    // if userId passed is current user, also activate token
    if (_opt.userId === req.user._id) {
      await activateToken({ userId: _opt.userId!, token: req.token }, true)
    }
    console.log('[auth] setAccess', _sar)
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
