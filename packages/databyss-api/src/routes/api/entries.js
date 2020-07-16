import express from 'express'
import Block from '../../models/Block'
import Page from '../../models/Page'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'

const router = express.Router()

// @route    POST api/entries/search/
// @desc     Searches entries
// @access   Private
router.post(
  '/search/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      // todo: regex escape function
      const queryArray = req.body.data
        .replace(/[^a-z0-9À-ú- ]/gi, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(' ')

      let results = await Block.find({
        $text: {
          $search: queryArray.join(' '),
        },
        account: req.account._id,
        type: 'ENTRY',
      })

      // populate results with page
      results = await Promise.all(
        results.map(async r => {
          // get page where entry is found
          const _page = await Page.findOne({
            blocks: { $in: [{ _id: r._id }] },
            account: req.account._id,
          })

          return Object.assign({ page: _page }, r._doc)
        })
      )

      if (results) {
        let _results = {
          count: results.length,
          results: {},
        }

        // checks if exact words are in result
        const isInEntry = (string, regex) =>
          string
            .replace(/[^a-z0-9À-ú- ]/gi, '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .match(regex)

        /*
        compose results
        */
        _results = results.reduce((acc, curr) => {
          // create regEx or operator to find exact word match

          const searchstring = new RegExp(
            queryArray.length > 1
              ? `^${queryArray
                  .map(
                    q =>
                      `(?=.*\\b${q
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')}\\b.*)`
                  )
                  .join('')}.*$`
              : `\\b${queryArray[0]
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')}\\b`,
            'i'
          )

          // only show results with associated pages
          if (!curr.page) {
            _results.count -= 1
            return acc
          }

          const pageId = curr.page._id.toString()

          // console.log('accumulater', acc)

          if (!acc.results[pageId]) {
            // bail if not exact word in entry
            if (!isInEntry(curr.text.textValue, searchstring)) {
              _results.count -= 1
              return acc
            }

            // init result
            acc.results[pageId] = {
              page: curr.page.name,
              pageId,
              entries: [
                {
                  entryId: curr._id,
                  text: curr.text.textValue,
                  //  blockId: curr.block,
                },
              ],
            }
          } else {
            // bail if not exact word in entry
            if (!isInEntry(curr.text.textValue, searchstring)) {
              _results.count -= 1
              return acc
            }
            const _entries = acc.results[pageId].entries

            _entries.push({
              entryId: curr._id,
              text: curr.text.textValue,
              // blockId: curr.block,
            })
            acc.results[pageId].entries = _entries
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
