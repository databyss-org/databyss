const mongoose = require('mongoose')
const Range = require('./Range')

const RichTextSchema = new mongoose.Schema({
  textValue: { type: String },
  ranges: [Range],
})

module.exports = RichTextSchema
