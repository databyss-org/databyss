import { bugsnagClient } from '../../middleware/bugsnag'

const express = require('express')

const router = express.Router()

router.get('/', () => {
  bugsnagClient.notify(new Error('Test notify error'))

  throw new Error('Test throw error')
})

module.exports = router
