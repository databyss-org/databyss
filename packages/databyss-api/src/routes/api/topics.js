import express from 'express'
import Topic from '../../models/Topic'

import auth from '../../middleware/auth'
import accountMiddleware from '../../middleware/accountMiddleware'

const router = express.Router()

// @route    POST api/topics
// @desc     Add Topic
// @access   Private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    const { text, _id, pageId } = req.body.data

    // res.status(200)
    const topicFields = {
      text,
      account: req.account.id.toString(),
      _id,
    }

    // if topic exists update it and exit
    try {
      let topic = await Topic.findOne({ _id })
      if (topic) {
        const _pages = topic.pages ? topic.pages : []
        // if page doesnt exist in topic page array, add to topic fields
        if (pageId && !_pages.find(p => p._id.toString() === pageId)) {
          const _pageField = { _id: pageId }
          _pages.push(_pageField)
          topicFields.pages = _pages
        }

        topicFields._id = _id
        topic = await Topic.findOneAndUpdate(
          { _id },
          { $set: topicFields },
          { new: true }
        ).then(response => res.json(response))
      } else {
        // if new topic has been added
        topicFields.pages = [{ _id: pageId }]
        const topic = new Topic(topicFields)
        const post = await topic.save()
        res.json(post)
      }
      return res.status(200)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

// @route    GET api/topics
// @desc     Get topic by id
// @access   Private
router.get(
  '/:id',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const topic = await Topic.findOne({
        _id: req.params.id,
      })

      if (!topic) {
        return res.status(404).json({ msg: 'There is no topic for this id' })
      }

      return res.json(topic)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server error')
    }
  }
)

// @route    GET api/topics
// @desc     Get all topics
// @access   Private
router.get(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    try {
      const topicResponse = await Topic.find({ account: req.account._id })

      if (!topicResponse) {
        return res
          .status(400)
          .json({ msg: 'There are no topics associated with this account' })
      }

      return res.json(topicResponse)
    } catch (err) {
      console.error(err.message)
      return res.status(500).send('Server Error')
    }
  }
)

export default router
