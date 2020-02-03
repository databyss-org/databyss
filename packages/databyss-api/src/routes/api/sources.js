import express from 'express'
import Source from '../../models/Source'
import Page from '../../models/Page'
import Block from '../../models/Block'
import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'

const router = express.Router()

// @route    POST api/sources
// @desc     Add Source
// @access   Private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    const { text, authors, citations, _id } = req.body.data

    const sourceFields = {
      text,
      citations,
      authors,
      account: req.account.id.toString(),
      _id,
    }

    // if source exists update it and exit
    try {
      let source = await Source.findOne({ _id })
      if (source) {
        sourceFields._id = _id
        source = await Source.findOneAndUpdate(
          { _id },
          { $set: sourceFields },
          { new: true }
        ).then(response => res.json(response))
      } else {
        // if new source has been added
        const sources = new Source(sourceFields)
        const post = await sources.save()
        res.json(post)
      }
      return res.status(200)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

router.get(
  '/list',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const _list = JSON.parse(req.query.array)

      const sourceList = await Promise.all(
        _list.map(async _id => {
          const source = await Source.findOne({ _id })
          return source
        })
      )

      const sourceDict = {}
      sourceList.forEach(s => (sourceDict[s._id] = s))

      return res.json(sourceDict)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

// @route    GET api/sources
// @desc     Get source by id
// @access   Private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const source = await Source.findOne({
        _id: req.params.id,
      })

      if (!source) {
        return res.status(404).json({ msg: 'There is no source for this id' })
      }

      return res.json(source)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

router.get(
  '/pages/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      // find page blocks corresponding to page ID
      const pageResponse = await Page.findOne({ _id: req.params.id })
      if (!pageResponse) {
        return res
          .status(400)
          .json({ msg: 'There are no pages associated with this id' })
      }

      const { blocks } = pageResponse
      // return an array of all sources relating to page ID
      let sourceList = await Promise.all(
        blocks.map(async block => {
          let _source
          const blockResponse = await Block.findOne({ _id: block._id })
          if (blockResponse.type === 'SOURCE') {
            const source = await Source.findOne({ _id: blockResponse.sourceId })
            if (source) {
              _source = source
              // return source
            }
          }
          return _source
        })
      )
      // remove null values
      sourceList = sourceList.filter(s => typeof s !== 'undefined')

      // convert array to dictionary and return dictionary
      const sourceDict = {}
      sourceList.forEach(s => (sourceDict[s._id] = s))
      return res.json(sourceDict)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const sourceResponse = await Source.find({ account: req.account._id })

      if (!sourceResponse) {
        return res
          .status(400)
          .json({ msg: 'There are no sources associated with this account' })
      }
      return res.json(sourceResponse)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
