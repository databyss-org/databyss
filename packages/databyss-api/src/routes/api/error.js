import { bugsnagClient } from '../../middleware/bugsnag'

import ApiError from '../../lib/ApiError'

const delay = timer => new Promise(resolve => setTimeout(resolve, timer))

const express = require('express')

const router = express.Router()

router.get('/', () => {
  bugsnagClient.notify(new Error('Test notify error'))

  throw new Error('Test throw error')
})

router.get('/api-error', () => {
  throw new ApiError('Test throw ApiError', 505)
})

router.get('/api-error-async', async (req, res, next) => {
  setTimeout(() => {
    next(new ApiError('Test throw ApiError from async', 505))
  }, 100)
})

router.get('/api-error-await', async (req, res, next) => {
  try {
    await delay(100)
    throw new ApiError('Test throw ApiError after await', 505)
    // eslint-disable-next-line no-unreachable
    console.log('unreachable code')
  } catch (err) {
    next(err)
  }
})

router.get('/api-server-await', (req, res) => {
  res.status(200).send()
})

module.exports = router
