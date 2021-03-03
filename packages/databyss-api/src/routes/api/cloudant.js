import express from 'express'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import auth from '../../middleware/auth'
import { UnauthorizedError } from '../../lib/Errors'
import createSharedGroupDatabase from './../../lib/createSharedGroupDatabase'

const router = express.Router()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

// @route    POST api/cloudant/groups
// @desc     creates a database for shared groups
// @access   private
router.post('/groups', auth, async (req, res) => {
  // get user id
  const _user = req.user
  const { groupId, isPublic } = req.body.data
  // TODO: only user who created the request should be able to also delete this database

  let credentials
  if (isPublic) {
    credentials = await createSharedGroupDatabase(groupId)
  }

  return res.json({ data: { credentials } }).status(200)
})

// @route    DELETE api/cloudant/
// @desc     delete all user database, for use in tests only
// @access   private
router.delete('/', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return new UnauthorizedError()
  }
  const _dbs = await cloudant.db.list()
  // console.log(_dbs)
  if (_dbs.length) {
    for (const _db of _dbs) {
      await cloudant.db.destroy(_db)
      // dont exceed cloudant rate limit
      await sleep(100)
      console.log(`destroyed - ${_db}`)
    }
  }

  return res.status(200).send()
})

export default router
