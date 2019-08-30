const mongoose = require('mongoose')

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

const Motif = mongoose.models.Motif || mongoose.model('motif', MotifSchema)

module.exports = Motif
