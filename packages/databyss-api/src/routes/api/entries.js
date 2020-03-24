import express from 'express'
import Entry from '../../models/Entry'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'

const router = express.Router()

// @route    GET api/entries/search/:string
// @desc     Searches entries
// @access   Private
router.get(
  '/search/:string',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      console.log('string', req.params.string)
      // find string in entries

      //   Entry.find({ $text: { $search: req.params.string } })
      //     .skip(20)
      //     .limit(10)
      //     .exec(function(err, docs) {
      //       console.log(docs)
      //     })

      return res.status(200)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
