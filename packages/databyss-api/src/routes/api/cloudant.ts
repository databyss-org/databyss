import express from 'express'
import { cloudant } from '@databyss-org/services/lib/cloudant'
import { wrap } from 'lodash'

const router = express.Router()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

// @route    DELETE api/cloudant/
// @desc     delete all user database, for use in tests only
// @access   private
router.delete('/', async (req, res) => {
  const _dbs = await cloudant.db.list()
  // console.log(_dbs)
  if (_dbs.length) {
    for (const _db of _dbs) {
      if (_db.substring(0, 2) === 'g_') {
        await cloudant.db.destroy(_db)
        // dont exceed cloudant rate limit
        await sleep(50)
        console.log(`destroyed - ${_db}`)
      }
    }
  }

  res.status(200).send()
})

export default router
