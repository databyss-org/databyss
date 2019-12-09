const mongoose = require('mongoose')

const Text = new mongoose.Schema(
  {
    textValue: { type: String, default: 's' },
  },
  { minimize: false }
)

module.exports = Text
