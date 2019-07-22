const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MotifSchema = new mongoose.Schema({
  cfauthors: [
    {
      type: String,
    },
  ],
  id: {
    type: String,
  },
  name: {
    type: String,
  },
  motifStyleManual: {
    type: Boolean,
  },
  parsedWords: [
    {
      // word: { type: String },
      // selected: { type: Boolean },
    },
  ],
  otherWords: [{ type: String }],
})

module.exports = Motif = mongoose.model('motif', MotifSchema)
