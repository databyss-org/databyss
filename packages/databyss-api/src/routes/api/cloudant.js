import express from 'express'
import { cloudant } from '@databyss-org/data/couchdb/cloudant'
// import { Users } from '@databyss-org/data/couchdb'
import auth from '../../middleware/auth'
import { UnauthorizedError } from '../../lib/Errors'

const router = express.Router()

export const sleep = (m) => new Promise((r) => setTimeout(r, m))

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

// @route    POST api/cloudant/
// @desc     Updates user preferences
// @access   private
router.post('/user', auth, async (req, res) => {
  // const { session } = req.body.data
  // user from auth token to user from session token
  console.log('TODO ADD SYNC IN GROUP DB')
  // if (session.userId === req.user.id) {
  //   const _selector = {
  //     selector: {
  //       _id: { $eq: session.userId },
  //     },
  //   }
  //   const _res = await Users.find(_selector)
  //   if (!_res.docs.length) {
  //     return res.status(401)
  //   }
  //   const user = _res.docs[0]
  //   await Users.upsert(user._id, (oldDoc) => ({
  //     ...oldDoc,
  //     defaultPageId: session.defaultPageId,
  //   }))
  // }

  return res.status(200).send()
})

export default router
