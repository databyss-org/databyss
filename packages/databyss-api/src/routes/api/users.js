import express from 'express'
import querystring from 'querystring'
import humanReadableIds from 'human-readable-ids'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator/check'
import { google } from 'googleapis'
import { uid } from '@databyss-org/data/lib/uid'
import { Users, Logins } from '@databyss-org/data/couchdb'
import { Base64 } from 'js-base64'
import { send } from '../../lib/postmark'
import { getSessionFromUserId, getTokenFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'
import { createUserDatabaseCredentials } from '../../lib/createUserDatabase'

const router = express.Router()

const oauth2Client = new google.auth.OAuth2(
  process.env.API_GOOGLE_CLIENT_ID,
  process.env.API_GOOGLE_CLIENT_SECRET,
  process.env.API_GOOGLE_REDIRECT_URI
)

const oauth2ClientMobile =
  process.env.API_GOOGLE_REDIRECT_URI_MOBILE &&
  new google.auth.OAuth2(
    process.env.API_GOOGLE_CLIENT_ID,
    process.env.API_GOOGLE_CLIENT_SECRET,
    process.env.API_GOOGLE_REDIRECT_URI_MOBILE
  )

// @route    POST api/users/google
// @desc     create or get profile info for google user
// @access   Public
router.post(
  '/google',
  wrap(async (req, res) => {
    const code = querystring.unescape(req.body.code)
    const oauth =
      oauth2ClientMobile && req.header('x-databyss-mobile')
        ? oauth2ClientMobile
        : oauth2Client

    oauth.getToken(code, async (err, tokens) => {
      if (err) {
        console.error(err)
        res.status(400).json({ msg: 'OAuth Error' })
        return
      }

      const decoded = jwt.decode(tokens.id_token)
      const { name, email: _email, sub } = decoded

      const email = _email?.toLowerCase()
      const _selector = {
        selector: {
          googleId: { $eq: sub },
        },
      }
      let user = (await Users.find(_selector)).docs[0]

      if (!user) {
        user = {
          _id: uid(),
          name,
          email,
          googleId: sub,
        }
        await Users.insert(user)
      }

      const session = await getSessionFromUserId(user._id)

      // give user credentials, if default db does not exist for user, create one
      const credentials = await createUserDatabaseCredentials(session.user)

      session.groupCredentials = [credentials]
      res.json({ data: { session } })
    })
  })
)

// @route    POST api/users/email
// @desc     creates new user and sends email
// @access   Public
router.post(
  '/email',
  [check('email', 'Please include a valid email').isEmail()],
  wrap(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email: _email } = req.body
    let emailExists = true

    const email = _email?.toLowerCase()

    const _selector = {
      selector: {
        email: { $eq: email },
      },
    }

    const user = await Users.find(_selector)
    let _userId
    if (!user.docs.length) {
      _userId = uid()
      // Creates new user
      emailExists = false
      await Users.insert({
        _id: _userId,
        email,
      })
    } else {
      _userId = user.docs[0]._id
    }

    const token = await getTokenFromUserId(_userId)

    const loginObj = {
      email,
      code:
        process.env.NODE_ENV === 'test'
          ? 'test-code-42'
          : humanReadableIds.hri.random(),
      token,
      date: Date.now(),
    }

    Logins.upsert({ email, code: loginObj.code }, () => loginObj)

    const msg = {
      From: process.env.TRANSACTIONAL_EMAIL_SENDER,
      To: email,
      TemplateAlias: emailExists ? 'databyss_login_v2' : 'databyss_signup_v2',
      TemplateModel: {
        code: loginObj.code,
        auth: Base64.encodeURI(JSON.stringify([email, loginObj.code])),
        url: process.env.LOGIN_URL,
      },
    }
    send(msg)
    res.status(200).json({})
    return res.status(200)
  })
)

// @route    GET api/auth/user
// @desc     return user information
// @access   Public
router.post(
  '/',
  wrap(async (req, res) => {
    const { authToken } = req.body.data

    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET)
      if (decoded) {
        //
        let user = await Users.get(decoded.user.id)
        if (user) {
          user = { email: user.email }
        }

        return res.json({ data: { ...user } }).status(200)
      }
      return res.status(401).json({ msg: 'Token is not valid' })
    } catch (err) {
      return res.status(401).json({ msg: 'Token is not valid' })
    }
  })
)

export default router
