const express = require('express')
const bcrypt = require('bcryptjs')
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')

const router = express.Router()
const { check, validationResult } = require('express-validator/check')

const User = require('../../models/User')
const Login = require('../../models/Login')

// @route    GET api/auth
// @desc     verify user
// @access   Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')

    res.json(user)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
    throw new Error('err')
  }
})

// @route    POST api/auth/code
// @desc     verify user with code
// @access   Public
router.post('/code', async (req, res) => {
  try {
    const { code } = req.body
    const query = Login.findOne({ code })
    query.exec((err, login) => {
      if (err) {
        console.error(err.message)
        res.status(500).send('Server Error')
        throw new Error('err')
      }
      if (login) {
        if (login.date.getTime() >= Date.now() - 3600000) {
          const token = login.token
          const deleteQuery = Login.findOneAndRemove({ code })
          deleteQuery.exec(err => {
            if (err) {
              console.error(err.message)
              res.status(500).send('Server Error')
              throw new Error('err')
            }
            res.json({ token })
          })
        } else {
          res.status(401).json({ err: 'timed out' })
        }
      } else {
        res.status(404)
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
    throw new Error('err')
  }
})

// @route    POST api/auth
// @desc     Authenticate user & get token
// @access   Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] })
      }

      const payload = {
        user: {
          id: user.id,
        },
      }

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err
          res.json({ token })
        }
      )
      return res.status(200)
    } catch (err) {
      console.error(err.message)
      res.status(500).send('Server error')
      throw new Error('err')
    }
  }
)

module.exports = router
