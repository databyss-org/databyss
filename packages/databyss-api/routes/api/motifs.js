const express = require('express')
const router = express.Router()
const Motif = require('../../models/Motif')
const fs = require('fs')

// const Entry = require('../../models/Entry')

const auth = require('../../middleware/auth')

// @route    POST api/motifs
// @desc     Adds author
// @access   Private
router.post('/', async (req, res) => {
  /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

*/

  const { cfauthors, id, name, parsedWords, otherWords } = req.body

  const authFields = {
    cfauthors,
    id,
    name,
    parsedWords,
    otherWords,
  }

  // Updated if author already exists
  try {
    /*
    let author = await Motif.findOne({ _id: _id })
    if (author) {
      if (req.user.id.toString() !== author.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }

      authFields._id = _id
      author = await Motif.findOneAndUpdate({ _id: _id }, { $set: authFields })

      return res.json(author)
    }
*/
    motif = new Motif(authFields)

    const post = await motif.save()
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route    GET api/authors/
// @desc     Get author by ID
// @access   private
router.get('/:id', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
*/

    const author = await Motif.findOne({
      _id: req.params.id,
    })

    if (!author) {
      return res.status(400).json({ msg: 'There is no author for this id' })
    }

    if (req.user.id.toString() !== author.user.toString()) {
      return res.status(401).json({ msg: 'This post is private' })
    }

    res.json(author)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})
// @route    GET api/motifs/
// @desc     Get all motifs
// @access   private
router.get('/', async (req, res) => {
  try {
    //  const author = await Motif.find({ user: req.user.id })
    const motif = await Motif.find()

    if (!motif) {
      return res.status(400).json({ msg: 'There are no Motifs' })
    }

    let newData = motif.map(async m => {
      let obj = m
      obj.motifStyleManual = false
      obj.parsedWords = m.name.split(' ').map(w => ({
        word: w,
        selected: true,
      }))
      obj.otherWords = []
      const newMotif = await Motif.findOne({
        _id: m._id,
      })
      if (newMotif) {
        newMotif = await Motif.findOneAndUpdate({ _id: m._id }, { $set: obj })
        //  res.json(motif)
        console.log(obj.name)
      }

      //  return m
    })

    res.json(motif)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
