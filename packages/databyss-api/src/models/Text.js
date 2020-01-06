const mongoose = require('mongoose')

const TextSchema = new mongoose.Schema({
  textValue: { type: String, default: '' },
})

const Text = mongoose.models.Text || mongoose.model('text', TextSchema)

module.exports = Text
