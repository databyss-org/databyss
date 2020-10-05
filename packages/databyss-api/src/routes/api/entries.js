/* eslint-disable no-restricted-syntax, no-await-in-loop */
import express from 'express'
import Block from '../../models/Block'
import BlockRelation from '../../models/BlockRelation'

import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'
import wrap from '../../lib/guardedAsync'
import { addRelationships } from '../../lib/entries'
import {
  getBlockRelationsAccountQueryMixin,
  getBlockAccountQueryMixin,
} from './helpers/accountQueryMixin'

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
          page: clearPageRelationships,
          account: req.account._id,
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
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  wrap(async (req, res, _next) => {
    const atomicId = req.params.id

    const results = await BlockRelation.find({
      relatedBlock: atomicId,
      ...getBlockRelationsAccountQueryMixin(req),
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
          // sort the entries by page index value
          _entries.sort((a, b) => (a.blockIndex > b.blockIndex ? 1 : -1))

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
  [auth, accountMiddleware(['EDITOR', 'ADMIN', 'PUBLIC'])],
  async (req, res) => {
    try {
      // todo: regex escape function
      const _query = decodeURIComponent(req.body.data)

      const queryArray = _query.replace(/[^a-z0-9À-ú-/ ]/gi, '').split(' ')

      const results = await Block.aggregate([
        {
          $match: {
            $text: {
              $search: queryArray.join(' '),
              $diacriticSensitive: false,
            },
            ...getBlockAccountQueryMixin(req),
            type: 'ENTRY',
          },
        },
        {
          // appends all the pages block appears in in an array 'page'
          $lookup: {
            from: 'pages',
            localField: '_id',
            foreignField: 'blocks._id',
            as: 'page',
          },
        },
        // filter out archived pages,
        {
          $project: {
            score: { $meta: 'textScore' },
            _id: 1,
            text: 1,
            account: 1,
            type: 1,
            page: {
              $filter: {
                input: '$page',
                as: 'page',
                cond: { $eq: ['$$page.archive', false] },
              },
            },
          },
        },
        // filter out matches below threshhold
        // {
        //   $match: {
        //     score: { $gt: 1.0 },
        //   },
        // },
        // unwindws page array to page object
        { $unwind: '$page' },
      ])

      if (results) {
        let _results = {
          count: results.length,
          results: new Map(),
        }

        /*
        compose results
        */
        _results = results.reduce((acc, curr) => {
          // only show results with associated pages
          if (!curr.page) {
            _results.count -= 1
            return acc
          }

          const pageId = curr.page._id.toString()
          // get index where block appears on page
          const _blockIndex = curr.page.blocks.findIndex(
            b => b._id.toString() === curr._id.toString()
          )
          if (!acc.results.get(pageId)) {
            // init result
            const _data = {
              page: curr.page.name,
              pageId,
              maxTextScore: curr.score,
              entries: [
                {
                  entryId: curr._id,
                  text: curr.text,
                  index: _blockIndex,
                  textScore: curr.score,
                  //  blockId: curr.block,
                },
              ],
            }
            acc.results.set(pageId, _data)
            //      acc.results[pageId] = _data
          } else {
            const _data = acc.results.get(pageId)
            const _entries = _data.entries

            // have the max test score on the page dictionary
            let _maxScore = _data.maxTextScore

            if (curr.score > _maxScore) {
              _maxScore = curr.score
            }

            _entries.push({
              entryId: curr._id,
              text: curr.text,
              index: _blockIndex,
              textScore: curr.score,
            })

            // sort the entries by text score
            _entries.sort((a, b) => (a.textScore < b.textScore ? 1 : -1))
            _data.entries = _entries
            _data.maxTextScore = _maxScore

            acc.results.set(pageId, _data)

            //     acc.results[pageId] = _data
          }
          return acc
        }, _results)

        // sort the map according to the text score per page
        _results.results = new Map(
          [..._results.results].sort(([, v], [, v2]) => {
            if (v.maxTextScore < v2.maxTextScore) {
              return 1
            }
            if (v.maxTextScore > v2.maxTextScore) {
              return -1
            }
            return 0
          })
        )

        // convert from map back to object
        _results = {
          ..._results,
          results: Object.fromEntries(_results.results),
        }

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
