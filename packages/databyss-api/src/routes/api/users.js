const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const sgMail = require('@sendgrid/mail')
const hri = require('human-readable-ids').hri
const { check, validationResult } = require('express-validator/check')
const User = require('../../models/User')
const Login = require('../../models/Login')
const {
  getSessionFromUserId,
  getTokenFromUserId,
} = require('../../lib/session')

const router = express.Router()

// @route    POST api/users/google
// @desc     create or get profile info for google user
// @access   Public
router.post('/google', async (req, res) => {
  const { token } = req.body

  axios
    .get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`)
    .then(async response => {
      const id = response.data.sub
      try {
        let user = await User.findOne({ googleId: id })

        if (!user) {
          const { name, email, sub } = response.data
          user = await User.create({
            name,
            email,
            googleId: sub,
          })
        }

        const session = await getSessionFromUserId(user._id)
        return res.json({ data: { session } })
      } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server Error')
      }
    })
    .catch(err => {
      console.error(err.message)
      return res.status(400).json({ msg: 'There is no profile for this user' })
    })
})

// @route    POST api/users/email
// @desc     creates new user and sends email
// @access   Public
router.post(
  '/email',
  [check('email', 'Please include a valid email').isEmail()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)

    const { email } = req.body
    let emailExists = false

    try {
      let user = await User.findOne({ email })
      if (!user) {
        // Creates new user
        user = await User.create({
          email,
        })
      } else {
        emailExists = true
      }

      console.log('USER', user)
      const token = await getTokenFromUserId(user._id)
      const login = new Login({
        code: hri.random(),
        token,
      })
      login.save()
      const msg = {
        to: email,
        from: process.env.TRANSACTIONAL_EMAIL_SENDER,
        templateId: emailExists
          ? 'd-9e03c4ebd5a24560b6e02a15af4b9b2e'
          : 'd-845a6d7d37c14d828191b6c7933b20f7',
        dynamic_template_data: {
          code: login.code,
          url: process.env.LOGIN_URL,
        },
      }
      sgMail.send(msg)
      res.status(200).json({})
      return res.status(200)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

module.exports = router
