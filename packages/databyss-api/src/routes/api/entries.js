/* eslint-disable no-restricted-syntax, no-await-in-loop */
import express from 'express'
import Block from '../../models/Block'
import Page from '../../models/Page'
import BlockRelation from '../../models/BlockRelation'

import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import { addRelationships } from '../../lib/entries'

const router = express.Router()

// @route    POST api/entries/relations/
// @desc     creates on or more block relations
// @access   Private
router.post(
  '/relations/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res) => {
    const payloadArray = req.body.data

    for (const payload of payloadArray) {
      const { blocksRelationArray, clearPageRelationships } = payload

      // clear all block relationships associated to page id
      if (clearPageRelationships) {
        await BlockRelation.deleteMany({
          pageId: clearPageRelationships,
          accountId: req.account._id,
        })
      }
      if (blocksRelationArray.length) {
        for (const relationship of blocksRelationArray) {
          await addRelationships(relationship, req)
        }
      }
    }

    return res.status(200).end()
  })
)

// @desc get all blocks related to block with @id
// @returns {dictionary} pageid => BlockRelation[]
// @access   Private
router.get(
  '/relations/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  wrap(async (req, res, _next) => {
    const atomicId = req.params.id

    const results = await BlockRelation.find({
      relatedBlock: atomicId,
      account: req.account._id,
    })

    // sort according to block index
    results.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

    if (results) {
      let _results = {
        count: results.length,
        results: {},
      }

      _results = results.reduce((acc, curr) => {
        if (!acc.results[curr.page]) {
          // init result
          acc.results[curr.page] = [curr]
        } else {
          const _entries = acc.results[curr.page]

          _entries.push(curr)
          acc.results[curr.page] = _entries
        }
        return acc
      }, _results)

      return res.json(_results)
    }

    return res
      .status(400)
      .json({ msg: 'There are no relations for this block' })
  })
)

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
            'blocks._id': r._id,
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
            .replace(/(\n|\t)/g, ' ')
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
                  text: curr.text,
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
              text: curr.text,
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
