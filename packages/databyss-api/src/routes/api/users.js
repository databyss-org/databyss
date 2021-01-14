import express from 'express'
import _ from 'lodash'
import querystring from 'querystring'
import humanReadableIds from 'human-readable-ids'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator/check'
import { google } from 'googleapis'
import { uid } from '@databyss-org/data/lib/uid'
import { Users, Logins, Groups } from '@databyss-org/data/couchdb'
import { send } from '../../lib/sendgrid'
import { getTokenFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'

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
      let user = await Users.find(_selector)

      if (!user) {
        user = await Users.insert({
          _id: uid(),
          name,
          email,
          googleId: sub,
        })
      }
      res.json({ data: { user } }).status(200)
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
      const _res = await Users.insert({
        _id: _userId,
        email,
        groups: [],
      })
      console.log('RES', _res)
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
      TemplateAlias: emailExists ? 'databyss_login' : 'databyss_signup',
      TemplateModel: {
        code: loginObj.code,
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
          user = _.pick(user, ['defaultGroupId', 'email'])
        }

        if (user) {
          let group = await Groups.get(user.defaultGroupId)
          if (group) {
            group = _.pick(group, 'defaultPageId')

            return res.json({ data: { ...user, ...group } }).status(200)
          }
        }
      }
      return res.status(401).json({ msg: 'Token is not valid' })
    } catch (err) {
      return res.status(401).json({ msg: 'Token is not valid' })
    }
  })
)

export default router
