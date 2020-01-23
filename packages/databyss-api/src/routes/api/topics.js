const express = require('express')
const Topic = require('../../models/Topic')

const auth = require('../../middleware/auth')
const accountMiddleware = require('../../middleware/accountMiddleware')

const router = express.Router()

// @route    POST api/topics
// @desc     Add Topic
// @access   Private
router.post(
  '/',
  [auth, accountMiddleware(['EDITOR', 'ADMIN'])],
  async (req, res) => {
    const { text, _id } = req.body.data

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
        topicFields._id = _id
        topic = await Topic.findOneAndUpdate(
          { _id },
          { $set: topicFields },
          { new: true }
        ).then(response => res.json(response))
      } else {
        // if new topic has been added
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

module.exports = router
