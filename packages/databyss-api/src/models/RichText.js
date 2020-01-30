const mongoose = require('mongoose')
const Range = require('./Range')

const RichTextSchema = new mongoose.Schema(
  {
    textValue: { type: String, default: '' },
    ranges: {
      type: [Range],
      default: [],
    },
  },
  { _id: false }
)

const RichText = mongoose.model('richtext', RichTextSchema)

module.exports = RichText
