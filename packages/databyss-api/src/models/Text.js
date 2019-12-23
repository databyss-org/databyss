const mongoose = require('mongoose')

const Text = new mongoose.Schema({
  textValue: { type: String, default: '' },
})

module.exports = Text
