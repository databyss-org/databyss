import express from 'express'
import querystring from 'querystring'
import humanReadableIds from 'human-readable-ids'
import jwt from 'jsonwebtoken'
import { check, validationResult } from 'express-validator/check'
import { google } from 'googleapis'
import { send } from '../../lib/sendgrid'
import User from '../../models/User'
import Login from '../../models/Login'
import { getSessionFromUserId, getTokenFromUserId } from '../../lib/session'
import wrap from '../../lib/guardedAsync'

const router = express.Router()

const oauth2Client = new google.auth.OAuth2(
  process.env.API_GOOGLE_CLIENT_ID,
  process.env.API_GOOGLE_CLIENT_SECRET,
  process.env.API_GOOGLE_REDIRECT_URI
)

// @route    POST api/users/google
// @desc     create or get profile info for google user
// @access   Public
router.post(
  '/google',
  wrap(async (req, res) => {
    const code = querystring.unescape(req.body.code)

    oauth2Client.getToken(code, async (err, tokens) => {
      if (err) {
        console.error(err)
        res.status(400).json({ msg: 'OAuth Error' })
        return
      }

      const decoded = jwt.decode(tokens.id_token)
      const { name, email, sub } = decoded
      let user = await User.findOne({ googleId: sub })
      if (!user) {
        user = await User.create({
          name,
          email,
          googleId: sub,
        })
      }
      const session = await getSessionFromUserId(user._id)
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

    const { email } = req.body
    let emailExists = false

    let user = await User.findOne({ email })
    if (!user) {
      // Creates new user
      user = await User.create({
        email,
      })
    } else {
      emailExists = true
    }

    const token = await getTokenFromUserId(user._id)
    const loginObj = {
      email,
      code:
        process.env.NODE_ENV === 'test'
          ? 'test-code-42'
          : humanReadableIds.hri.random(),
      token,
    }
    await Login.replaceOne({ email, code: loginObj.code }, loginObj, {
      upsert: true,
    })
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

export default router
