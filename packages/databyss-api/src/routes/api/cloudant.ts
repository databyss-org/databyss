import express from 'express'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
import { SysUser, SysGroup, Role } from '@databyss-org/data/interfaces'
import { groupMiddleware, authMiddleware } from '../../middleware'
import { UnauthorizedError } from '../../lib/Errors'
import createSharedGroupDatabase, {
  getDB,
  verifyDatabaseCredentials,
  deleteSharedGroupDatabase,
  removeIdsFromSharedDb,
} from './../../lib/createSharedGroupDatabase'
import { setSecurity, deleteGroupId } from '../../lib/createUserDatabase'

declare module 'express-serve-static-core' {
  export interface Request {
    user?: SysUser
    group?: SysGroup
  }
}

const router = express.Router()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

// @route    DELETE api/cloudant/groups/remove
// @desc     removes page from shared database
// @access   private
router.post(
  '/groups/:id/remove',
  [authMiddleware, groupMiddleware([Role.Admin])],
  async (req, res) => {
    const { ids } = req.body.data

    // remove pageId from shared database
    await removeIdsFromSharedDb({ ids, dbName: req.group!._id })
    return res.status(200).json({}).send()
  }
)

// @route    POST api/cloudant/groups/credentials/:id
// @desc     creates database credentials
// @access   private
router.post(
  '/groups/:id/credentials/',
  [authMiddleware, groupMiddleware([Role.Admin])],
  async (req, res) => {
    // get user id
    const groupId = req.params.id
    const { isPublic, preservePublic } = req.body.data

    const credentials = await setSecurity({
      groupId,
      isPublic,
      preservePublic,
    })

    return res.json({ data: { credentials } }).status(200)
  }
)

// @route    POST api/cloudant/groups/auth:id
// @desc     verifies user credentials
router.post(
  '/groups/:id/auth',
  [authMiddleware, groupMiddleware([Role.Admin])],
  async (req, res) => {
    const { credentials } = req.body.data

    // check if group exists
    const _db = await getDB({ dbName: req.group!._id })
    if (!_db) {
      return res.status(404).json({ message: 'database does not exist' }).send()
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
  }
)

// @route    DELETE api/cloudant/groups
// @desc     removes a database for shared groups
router.delete(
  '/groups/:id',
  [authMiddleware, groupMiddleware([Role.Admin])],
  async (req, res) => {
    // if user is authorized, remove database and return apiKey to be deleted on the client
    await deleteSharedGroupDatabase(req.group!._id)
    // remove the Group from internal cloudant DB
    await deleteGroupId(req.group!._id)

    return res.status(200).send()
  }
)

// @route    POST api/cloudant/groups
// @desc     creates a database for shared groups
router.post('/groups/:id', authMiddleware, async (req, res) => {
  // get user id
  const userId = req.user!._id
  const groupId = req.params.id
  const { isPublic } = req.body.data

  let credentials
  if (isPublic) {
    credentials = await createSharedGroupDatabase({
      groupId,
      userId,
    })
  }

  // NOTE: if isPublic is false, currently does nothing

  return res.json({ data: { credentials } }).status(200)
})

// @route    DELETE api/cloudant/
// @desc     delete all user database, for use in tests only
// @access   private
router.delete('/', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return new UnauthorizedError()
  }
  const _dbs = await cloudant.current.db.list()
  if (_dbs.length) {
    for (const _db of _dbs) {
      await cloudant.current.db.destroy(_db)
      // dont exceed cloudant rate limit
      await sleep(100)
      console.log(`destroyed - ${_db}`)
    }
  }

  return res.status(200).send()
})

export default router
