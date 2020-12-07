import express from 'express'
import querystring from 'querystring'
import humanReadableIds from 'human-readable-ids'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator/check'
import { google } from 'googleapis'
import { Users, Logins } from '@databyss-org/data/serverdbs'
import { send } from '../../lib/sendgrid'
import User from '../../models/User'
import Account from '../../models/Account'
// import Login from '../../models/Login'
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

      // let user = await Users.get({ googleId: sub })

      // let user = await User.findOne({ googleId: sub })
      if (!user) {
        user = await Users.insert({
          name,
          email,
          googleId: sub,
        })
        // user = await User.create({
        //   name,
        //   email,
        //   googleId: sub,
        // })
      }
      // const session = await getSessionFromUserId(user.id)
      res.json({ data: { user } }).status(200)

      //   res.json({ data: { session } })
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
    // todo: use users.get({})
    let user = await Users.find(_selector)

    if (!user.docs.length) {
      // Creates new user
      emailExists = false
      await Users.insert({
        email,
        groups: [],
      })
      user = await Users.find(_selector)
    }

    user = user.docs[0]

    const token = await getTokenFromUserId(user._id)
    const loginObj = {
      email,
      code:
        process.env.NODE_ENV === 'test'
          ? 'test-code-42'
          : humanReadableIds.hri.random(),
      token,
      createdAt: Date.now(),
    }

    Logins.upsert({ email, code: loginObj.code }, () => loginObj)

    const msg = {
      to: email,
      from: process.env.TRANSACTIONAL_EMAIL_SENDER,
      templateId: emailExists
        ? 'd-9e03c4ebd5a24560b6e02a15af4b9b2e'
        : 'd-845a6d7d37c14d828191b6c7933b20f7',
      dynamic_template_data: {
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
        const user = await User.findOne({ _id: decoded.user.id }).select(
          'defaultAccount email'
        )
        if (user) {
          const account = await Account.findOne({
            _id: user.defaultAccount,
          }).select('defaultPage')
          if (account) {
            return res
              .json({ data: { ...user._doc, ...account._doc } })
              .status(200)
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
