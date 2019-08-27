const express = require('express')
const mongoose = require('mongoose')
const _ = require('lodash')
const Page = require('../../models/Page')
const auth = require('../../middleware/auth')

const router = express.Router()

// @route    POST api/page
// @desc     Adds Page
// @access   private
router.post('/', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
*/
    // update if page exists

    const { name, blocks, _id } = req.body

    let page = await Page.findOne({ _id })
    if (page) {
      if (req.user.id.toString() !== page.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }

      page = await Page.findOneAndUpdate({ _id }, { $set: { name, blocks } })
    } else {
      const newId = new mongoose.mongo.ObjectId(!_.isEmpty(_id) && _id)

      page = new Page({
        _id: newId,
        name,
        blocks,
        user: req.user.id,
      })
    }
    const post = await page.save()

    return res.json(post)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server error')
  }
})

// @route    GET api/page/
// @desc     Get page by ID
// @access   private
router.get('/:id', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
*/

    const page = await Page.findOne({
      _id: req.params.id,
    })

    if (!page) {
      return res.status(400).json({ msg: 'There is no page for this id' })
    }

    if (req.user.id.toString() !== page.user.toString()) {
      return res.status(401).json({ msg: 'This page is private' })
    }

    return res.json(page)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    GET api/page/
// @desc     Get all pages
// @access   private
router.get('/', auth, async (req, res) => {
  try {
    const page = await Page.find({ user: req.user.id })
    if (!page) {
      return res.status(400).json({ msg: 'There are no pages' })
    }

    return res.json(page)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
