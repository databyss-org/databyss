import express from 'express'
import Block from '../../models/Block'
import Page from '../../models/Page'
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
      const queryArray = req.params.string.split(' ')

      // use the $and operator to find regEx for multiple search words
      const results = await Block.find({
        $and: queryArray.map(q => ({
          'text.textValue': {
            $regex: new RegExp(`\\b${q}\\b.*`, 'i'),
          },
          account: req.account._id,
          type: 'ENTRY',
        })),
      }).populate('page')

      if (results) {
        let _results = {
          count: results.length,
          results: {},
        }

        // takes in a string of words and searches if exact query is found in string
        const isInEntry = (string, regex) =>
          string
            .split(/ |-|\n/)
            .reduce(
              (bool, string) => (string.match(regex) ? true : bool),
              false
            )

        /*
        compose results
        */
        _results = await results.reduce(async (acc, curr) => {
          // create regEx or operator to find exact word match
          const searchstring = new RegExp(`^${queryArray.join('|')}$`, 'i')

          // only show results with associated page

          // get page where entry is found
          const _page = await Page.findOne({
            blocks: { $in: [{ _id: curr._id }] },
            account: req.account._id,
          })

          if (!_page) {
            _results.count -= 1
            return acc
          }

          if (!acc.results[_page._id]) {
            // bail if not exact word in entry
            if (!isInEntry(curr.text.textValue, searchstring)) {
              _results.count -= 1
              return acc
            }
            // init result
            acc.results[_page._id] = {
              page: _page.name,
              pageId: _page._id,
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
            const _entries = acc.results[_page._id].entries

            _entries.push({
              entryId: curr._id,
              text: curr.text.textValue,
              blockId: curr.block,
            })
            acc.results[_page._id].entries = _entries
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
