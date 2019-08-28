const express = require('express')
const ApiError = require('./ApiError')

const router = express.Router()

const Author = require('../../models/Author')
// const Entry = require('../../models/Entry')

const auth = require('../../middleware/auth')

// @route    POST api/authors
// @desc     Adds author
// @access   Private
router.post('/', auth, async (req, res) => {
  /*
      INSERT ERROR HANDLER HERE
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

*/
  const { firstName, lastName, _id, entries, sources } = req.body

  const authFields = {
    firstName,
    lastName,
    entries,
    sources,
    user: req.user.id,
  }

  // Updated if author already exists
  try {
    let author = await Author.findOne({ _id })
    if (author) {
      if (req.user.id.toString() !== author.user.toString()) {
        throw new ApiError('This post is private', 401)

        // return res.status(401).json({ msg: 'This post is private' })
      }

      authFields._id = _id
      author = await Author.findOneAndUpdate({ _id }, { $set: authFields })
      return res.json(author)
    }
    author = new Author({
      firstName,
      lastName,
      entries,
      sources,
      user: req.user.id,
    })

    const post = await author.save()
    return res.json(post)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server error')
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

    const author = await Author.findOne({
      _id: req.params.id,
    })
      .populate('entries', 'entry')
      .populate('sources', 'resource')

    if (!author) {
      throw new ApiError('There is no author for this id', 400)

      // return res.status(400).json({ msg: 'There is no author for this id' })
    }

    if (!author.default) {
      if (req.user.id.toString() !== author.user.toString()) {
        return res.status(401).json({ msg: 'This post is private' })
      }
    }

    return res.json(author)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})
// @route    GET api/authors/
// @desc     Get all authors
// @access   private
router.get('/', auth, async (req, res) => {
  try {
    const author = await Author.find()
      .populate('entries', 'entry')
      .populate('sources', 'resource')
      .or([{ user: req.user.id }, { default: true }])

    // const author = await Author.find({ user: req.user.id })
    if (!author) {
      throw new ApiError('There are no authors', 400)
      //  return res.status(400).json({ msg: 'There are no authors' })
    }

    return res.json(author)
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.status).json({ message: err.message })
    }
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

module.exports = router
