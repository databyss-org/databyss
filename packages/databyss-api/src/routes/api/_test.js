const express = require('express')
const { dropTestDB } = require('../../lib/db')

const router = express.Router()

router.get('/drop_test_db', async (req, res) => {
  await dropTestDB(false)
  res.status(200).send('OK')
})

module.exports = router
