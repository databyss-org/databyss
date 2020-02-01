import express from 'express'
import { validationResult } from 'express-validator/check'
import auth from '../../middleware/auth'
import Profile from '../../models/Profile'
import User from '../../models/User'
import Entry from '../../models/Entry'
import Author from '../../models/Author'
import Source from '../../models/Source'
import Block from '../../models/Block'
import Page from '../../models/Page'
import Account from '../../models/Account'

const router = express.Router()

// @route    GET api/profile/me
// @desc     Get current users ID
// @access   Private
router.get('/me', auth, async (req, res) => {
  try {
    return res.json(req.user.id)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
router.post('/', [auth], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  const { school } = req.body

  // Build profile object
  const profileFields = {}
  profileFields.user = req.user.id
  if (school) profileFields.school = school

  try {
    let profile = await Profile.findOne({ user: req.user.id })

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      )

      return res.json(profile)
    }

    // Create
    profile = new Profile(profileFields)

    await profile.save()
    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar'])
    return res.json(profiles)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar'])

    if (!profile) return res.status(400).json({ msg: 'Profile not found' })

    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Profile not found' })
    }
    return res.status(500).send('Server Error')
  }
})

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
router.delete('/', auth, async (req, res) => {
  try {
    // Remove profile
    await Profile.findOneAndRemove({ user: req.user.id })
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id })
    // Remove entries
    await Entry.findOneAndRemove({ user: req.user.id })
    // Remove author
    await Author.findOneAndRemove({ user: req.user.id })
    // Remove source
    await Source.findOneAndRemove({ user: req.user.id })
    // Remove page
    await Page.findOneAndRemove({ user: req.user.id })
    // Remove block
    await Block.findOneAndRemove({ user: req.user.id })
    // Remove account
    await Account.findOneAndRemove({ user: req.user.id })

    return res.json({ msg: 'User deleted' })
  } catch (err) {
    console.error(err.message)
    return res.status(500).send('Server Error')
  }
})

export default router
