const express = require('express')

// const auth = require('../../middleware/auth')
// const jwt = require('jsonwebtoken')

const router = express.Router()
// const { check, validationResult } = require('express-validator/check')

// const User = require('../../models/User')
const Login = require('../../models/Login')

// @route    POST api/login/code
// @desc     verify user, return token
// @access   Public
router.post('/code', async (req, res) => {
  const { code } = req.body
  try {
    const login = await Login.findOne({ code })

    res.json(login)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
    throw new Error('err')
  }
})

module.exports = router
