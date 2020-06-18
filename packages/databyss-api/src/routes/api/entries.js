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
      const searchKey = new RegExp(req.params.string, 'i')
      const results = await Entry.find({
        'text.textValue': searchKey,
        account: req.account._id,
      }).populate('page')

      if (results) {
        let _results = {
          count: results.length,
          results: {},
        }

        // takes in a string of words and searches if query is found in string
        const isInEntry = (string, query) =>
          string
            .split(/ |-/)
            .reduce(
              (bool, string) => (string.match(query) ? true : bool),
              false
            )

        /*
        compose results
        */
        _results = results.reduce((acc, curr) => {
          // regex to be matched
          const searchstring = new RegExp('^' + req.params.string + '$', 'i')

          // only show results with associated page
          if (!curr.page) {
            _results.count -= 1
            return acc
          }

          if (!acc.results[curr.page._id]) {
            // bail if not exact word in entry
            if (!isInEntry(curr.text.textValue, searchstring)) {
              _results.count -= 1
              return acc
            }
            // init result
            acc.results[curr.page._id] = {
              page: curr.page.name,
              pageId: curr.page._id,
              entries: [
                {
                  entryId: curr._id,
                  text: curr.text.textValue,
                  blockId: curr.block,
                },
              ],
            }
          } else {
            // bail if not exact word in entry
            if (!isInEntry(curr.text.textValue, searchstring)) {
              _results.count -= 1
              return acc
            }
            const _entries = acc.results[curr.page._id].entries

            _entries.push({
              entryId: curr._id,
              text: curr.text.textValue,
              blockId: curr.block,
            })
            acc.results[curr.page._id].entries = _entries
          }
          return acc
        }, _results)

        return res.json(_results)
      }
      return res
        .status(400)
        .json({ msg: 'There is no entries for this search' })
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
