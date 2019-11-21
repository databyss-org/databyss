const mongoose = require('mongoose')
const Range = require('./Range')

const RichText = new mongoose.Schema({
  textValue: { type: String },
  ranges: [Range],
})

module.exports = RichText
