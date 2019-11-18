const mongoose = require('mongoose')

const Range = new mongoose.Schema({
  length: {
    type: Number,
  },
  offset: {
    type: Number,
  },
  marks: {
    type: Array,
  },
})

module.exports = Range
