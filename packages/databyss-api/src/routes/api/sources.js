const express = require('express')
const _ = require('lodash')
const Source = require('../../models/Source')
const auth = require('../../middleware/auth')
const accountMiddleware = require('../../middleware/accountMiddleware')

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

module.exports = router
