const express = require('express')
const router = express.Router()
const Document = require('../../models/Document')
const auth = require('../../middleware/auth')

// @route    POST api/document
// @desc     Adds document
// @access   private
router.post('/', auth, async (req, res) => {
  try {
    /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

*/
    console.log('here')
    console.log(req.body)
    const { rawText, parsedText } = req.body
    const document = new Document({
      rawText,
      parsedText,
      user: req.user.id,
    })

    const post = await document.save()
    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route    GET api/document/
// @desc     Get document by ID
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

    const document = await Document.findOne({
      _id: req.params.id,
    })

    if (!document) {
      return res.status(400).json({ msg: 'There is no document for this id' })
    }

    res.json(document)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route    GET api/document/
// @desc     Get all documents
// @access   private
router.get('/', auth, async (req, res) => {
  try {
    const document = await Document.find()
    if (!document) {
      return res.status(400).json({ msg: 'There are no documents' })
    }

    res.json(document)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
