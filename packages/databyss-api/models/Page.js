const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  name: {
    type: String,
  },
  blocks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'block',
    },
  ],
})

const Page = mongoose.models.Block || mongoose.model('page', PageSchema)

module.exports = Page
