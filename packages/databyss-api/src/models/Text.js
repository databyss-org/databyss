const mongoose = require('mongoose')

const Text = new mongoose.Schema(
  {
    textValue: { type: String, default: '' },
  },
  { minimize: false }
)

module.exports = Text
