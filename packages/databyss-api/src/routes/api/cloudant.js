import express from 'express'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import auth from '../../middleware/auth'
import { UnauthorizedError } from '../../lib/Errors'
import createSharedGroupDatabase, {
  getDB,
  verifyUserOwnsDatabase,
  verifyDatabaseCredentials,
  deleteSharedGroupDatabase,
} from './../../lib/createSharedGroupDatabase'
import { setSecurity, deleteGroupId } from '../../lib/createUserDatabase'

const router = express.Router()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

// @route    POST api/cloudant/groups/credentials/:id
// @desc     creates database credentials
// @access   private
router.post('/groups/credentials/:id', auth, async (req, res) => {
  // get user id
  const userId = req.user.id
  const groupId = req.params.id
  const { isPublic } = req.body.data

  const _userAuthorized = await verifyUserOwnsDatabase({
    userId,
    dbName: groupId,
  })
  if (!_userAuthorized) {
    return res.status(401).json({ message: 'not authorized' })
  }

  const credentials = await setSecurity({
    groupId,
    isPublic,
  })

  return res.json({ data: { credentials } }).status(200)
})

// @route    POST api/cloudant/groups/auth:id
// @desc     verifies user credentials
// @access   private
router.post('/groups/auth/:id', auth, async (req, res) => {
  // get user id
  const groupId = req.params.id
  const userId = req.user.id
  const { credentials } = req.body.data
  // check if group exists
  const _db = await getDB({ dbName: groupId })
  if (!_db) {
    return res.status(404).json({ message: 'database does not exist' }).send()
  }
  // checks if user is owner of the database
  const _userAuthorized = await verifyUserOwnsDatabase({
    userId,
    dbName: groupId,
  })
  if (!_userAuthorized) {
    return res.status(401).json({ message: 'not authorized' }).send()
  }
  // verify credentials
  const { dbKey } = credentials
  const dbCredentialsVerified = await verifyDatabaseCredentials({
    dbKey,
    cloudantDb: _db,
  })
  if (!dbCredentialsVerified) {
    return res.status(401).json({ message: 'not authorized' }).send()
  }

  // all verification has passed

  return res.status(200).json({}).send()
})

// @route    POST api/cloudant/groups
// @desc     creates, resets or removes a database for shared groups
// @access   private
router.post('/groups', auth, async (req, res) => {
  // get user id
  const userId = req.user.id

  const { groupId, isPublic, reset } = req.body.data

  let credentials
  if (isPublic) {
    credentials = await createSharedGroupDatabase({
      groupId,
      userId,
      resetDb: reset,
    })
  } else {
    // first verify user owns database
    const _userAuthorized = await verifyUserOwnsDatabase({
      userId,
      dbName: groupId,
    })
    if (!_userAuthorized) {
      return res.status(401).json({ message: 'not authorized' })
    }
    // if user is authorized, remove database and return apiKey to be deleted on the client
    await deleteSharedGroupDatabase({ groupId })
    // remove the Group from internal cloudant DB
    await deleteGroupId({ groupId })
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
